// this strips white_space from everything but comments

start
  = tokens:line { return tokens.join(''); }

line
  = (token / white_space)*

token
  = $comment / $word

comment
  = "(" [^()]* ")"

word
  = [^ \t]+

white_space
  = [ \t] { return ''; }