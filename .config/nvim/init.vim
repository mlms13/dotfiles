"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" General Editor Config
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

imap jk <Esc>
imap kj <Esc>

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Plugins (load first)
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Specify a directory for plugins

call plug#begin(stdpath('data') . '/plugged')

Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'sheerun/vim-polyglot'

Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'

Plug 'preservim/nerdtree'

Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app && yarn install'  }

Plug 'aserebryakov/vim-todo-lists'

Plug 'christoomey/vim-tmux-navigator'

Plug 'sonph/onehalf', { 'rtp': 'vim' }

call plug#end()

" Theme
"""""""

set termguicolors

syntax on
set t_Co=256
set cursorline
colorscheme onehalfdark
let g:airline_theme='onehalfdark'

" Clipboard
"""""""""""
set clipboard+=unnamedplus

" Edit and source vimrc
"""""""""""""""""""""""
nnoremap <Leader>ve :e $MYVIMRC<CR>
nnoremap <Leader>vr :source $MYVIMRC<CR>

" Whitespace
"""""""""""""""""
" show space characters
set listchars+=space:·
set list

" highlight trailing space characters
highlight ExtraWhitespace ctermbg=0 guibg=#e06c75
match ExtraWhitespace /\s\+$/
autocmd BufWinEnter * match ExtraWhitespace /\s\+$/
autocmd InsertEnter * match ExtraWhitespace /\s\+\%#\@<!$/
autocmd InsertLeave * match ExtraWhitespace /\s\+$/
autocmd BufWinLeave * call clearmatches()

" trim trailing space on save
function! TrimWhitespace()
  if !&binary && &filetype != 'diff'
    let l:save = winsaveview()
    keeppatterns %s/\s\+$//e
    call winrestview(l:save)
  endif
endfun

autocmd BufWritePre,FileWritePre,FileAppendPre,FilterWritePre *
  \ :call TrimWhitespace()

" Tabs and Spaces
"""""""""""""""""
set tabstop=2

" length to use when shifting text (eg. <<, >> and == commands)
" (0 for ‘tabstop’):
set shiftwidth=0

" length to use when editing text (eg. TAB and BS keys)
" (0 for ‘tabstop’, -1 for ‘shiftwidth’):
set softtabstop=-1

" if set, only insert spaces; otherwise insert \t and complete with spaces:
set expandtab

" Line Numbers and Visual Rulers
"""""""""""""""
set nu
set relativenumber

set colorcolumn=80,120
highlight ColorColumn ctermbg=0 guibg=#313640

" Searching
"""""""""""

" case-insensitive unless uppercase in the search text
set ignorecase
set smartcase

" un-highlight results on enter key press
nnoremap <silent> <CR> :noh<CR>


" Cursor (blinking)
"
set guicursor=n-v-c:block,i-ci-ve:ver25,r-cr:hor20,o:hor50
  \,a:blinkwait700-blinkoff400-blinkon250-Cursor/lCursor
  \,sm:block-blinkwait175-blinkoff150-blinkon175

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Plugin-specific config
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

nnoremap <C-p> :FZF<CR>

nmap <silent> gd <Plug>(coc-definition)
nmap <silent> gy <Plug>(coc-type-definition)
nmap <silent> gi <Plug>(coc-implementation)
nmap <silent> gr <Plug>(coc-references)

" Coc completion shortcuts
inoremap <expr> <Tab> pumvisible() ? "\<C-n>" : "\<Tab>"
inoremap <expr> <S-Tab> pumvisible() ? "\<C-p>" : "\<S-Tab>"

" Remap keys for applying codeAction to the current buffer.
nmap <leader>ac  <Plug>(coc-codeaction)

" Apply AutoFix to problem on the current line.
" nmap <leader>qf  <Plug>(coc-fix-current)
