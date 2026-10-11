import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { userInfo } from "node:os";
import { join } from "node:path";

const home = userInfo().homedir;
const operations = new Set(["milestones", "pr-comments", "pr-review-comments", "pr-threads"]);
export const usage = `Usage: gh-read <operation> OWNER/REPO [PR_NUMBER]

  milestones          Open and closed milestones
  pr-comments         Conversation comments
  pr-review-comments  Flat inline review comments and replies
  pr-threads          Review threads, resolution state, and all replies

Repositories must be listed in ~/.agents/gh-read-repos.json.
`;

const commentFields = "id body url createdAt author { login } replyTo { id }";
const threadsQuery = `
query($owner: String!, $name: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $cursor) {
        nodes {
          id isResolved isOutdated path line startLine diffSide
          comments(first: 100) {
            nodes { ${commentFields} }
            pageInfo { hasNextPage endCursor }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}`;
const commentsQuery = `
query($id: ID!, $cursor: String) {
  node(id: $id) {
    ... on PullRequestReviewThread {
      comments(first: 100, after: $cursor) {
        nodes { ${commentFields} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}`;

export function parseArgs(args) {
  const [operation, repo, value] = args;
  if (!operations.has(operation)) throw new Error("Unknown operation. Use --help for usage.");
  if (args.length !== (operation === "milestones" ? 2 : 3)) {
    throw new Error("Unexpected or missing arguments. Arbitrary flags are not supported.");
  }
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("Repository must be owner/repo.");
  }
  if (operation !== "milestones" && (!/^[1-9][0-9]{0,9}$/.test(value) || Number(value) > 2147483647)) {
    throw new Error("PR number must be a positive 32-bit integer.");
  }
  return { operation, repo, number: value === undefined ? undefined : Number(value) };
}

export function request(method, endpoint, payload, run = spawnSync) {
  const args = ["api", "--hostname", "github.com", "--method", method];
  if (payload !== undefined) args.push("--input", "-");
  args.push("--", endpoint);
  const result = run("/opt/homebrew/bin/gh", args, {
    input: payload === undefined ? undefined : JSON.stringify(payload),
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 32 * 1024 * 1024,
    cwd: home,
    env: {
      HOME: home,
      PATH: "/opt/homebrew/bin:/usr/bin:/bin",
      GH_CONFIG_DIR: join(home, ".config/gh"),
      GH_PROMPT_DISABLED: "1",
      GH_PAGER: "cat",
      NO_COLOR: "1",
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr?.trim() || "GitHub request failed.");
  const data = JSON.parse(result.stdout);
  if (data?.errors?.length) throw new Error(JSON.stringify(data.errors));
  return data;
}

function nextCursor(connection, seen) {
  if (!connection.pageInfo.hasNextPage) return null;
  const cursor = connection.pageInfo.endCursor;
  if (!cursor || seen.has(cursor)) throw new Error("GitHub returned a missing or repeated pagination cursor.");
  seen.add(cursor);
  return cursor;
}

export function read(args, allowed, api = request) {
  const { operation, repo, number } = parseArgs(args);
  if (!Array.isArray(allowed) || !allowed.every((name) => typeof name === "string")) {
    throw new Error("gh-read-repos.json must contain an array of repository names.");
  }
  if (!allowed.some((name) => name.toLowerCase() === repo.toLowerCase())) {
    throw new Error(`Repository is not allowed: ${repo}`);
  }

  if (operation !== "pr-threads") {
    const suffix = operation === "milestones" ? "milestones"
      : operation === "pr-comments" ? `issues/${number}/comments` : `pulls/${number}/comments`;
    const items = [];
    for (let page = 1; ; page++) {
      const query = `per_page=100&page=${page}${operation === "milestones" ? "&state=all" : ""}`;
      const batch = api("GET", `repos/${repo}/${suffix}?${query}`);
      if (!Array.isArray(batch)) throw new Error("Expected a GitHub list response.");
      items.push(...batch);
      if (batch.length < 100) return items;
    }
  }

  const graphql = (query, variables) => api("POST", "graphql", { query, variables }).data;
  const [owner, name] = repo.split("/");
  let cursor = null;
  const threads = [];
  const seenThreads = new Set();
  do {
    const { repository } = graphql(threadsQuery, { owner, name, number, cursor });
    if (!repository?.pullRequest) throw new Error("Repository or pull request not found.");
    const connection = repository.pullRequest.reviewThreads;
    for (const thread of connection.nodes) {
      let comments = thread.comments;
      const allComments = [...comments.nodes];
      const seenComments = new Set();
      let commentCursor = nextCursor(comments, seenComments);
      while (commentCursor !== null) {
        comments = graphql(commentsQuery, { id: thread.id, cursor: commentCursor }).node.comments;
        allComments.push(...comments.nodes);
        commentCursor = nextCursor(comments, seenComments);
      }
      threads.push({ ...thread, comments: allComments });
    }
    cursor = nextCursor(connection, seenThreads);
  } while (cursor !== null);
  return threads;
}

if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
      process.stdout.write(usage);
    } else {
      parseArgs(args);
      const allowed = JSON.parse(readFileSync(join(home, ".agents/gh-read-repos.json"), "utf8"));
      process.stdout.write(`${JSON.stringify(read(args, allowed), null, 2)}\n`);
    }
  } catch (error) {
    console.error(`gh-read: ${error.message}`);
    process.exitCode = 1;
  }
}
