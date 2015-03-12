// this strips white_space from everything but comments

start
  = arr:($comment / other)* { return arr.join(''); }

comment
  = "(" [^()]* ")"

other
  = [^(]+ { return text().replace(/[ \t]/g, '').toLowerCase(); }