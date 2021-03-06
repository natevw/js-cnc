{
  var deg2rad = Math.PI / 180,
      rad2deg = 180 / Math.PI;
  function operate(first, rest) {
    if (!rest.length) return first;
    
    var lhs = first,
        next = rest.shift(),
        op = next[0],
        rhs = operate(next[1], rest);
    //return {l:lhs, o:op, r:rhs};
    return function expr() {
      return op(lhs(), rhs());
    };
  }
}


start
  = line

line
  = block_delete:"/"? n:line_number? segs:segment* { return {lineNumber:n, commands:segs, blockDeletes:Boolean(block_delete)}; }

line_number
  = "n" n:$digit+ { return +n; }

segment
  = mid_line_word / comment / parameter_setting

mid_line_word
  = w:mid_line_letter v:real_value { return {word:w,getValue:v}; }

real_value
  = real_number / expression / parameter_value / unary_combo
real_number
  = ("+" / "-")? ((digit+ "."? digit*) / ("." digit+)) { var n = +text(); return function literal() { return n; } }

expression
  = expression_recursively

// HT: https://github.com/ryansturmer/node-gcode/blob/b206530251a7a03af3feb0854ba469a06057eaf3/parser.pegjs#L47
expression_recursively
  = "[" expr:expr_op3 "]" { return expr; }
expr_op3
  = first:expr_op2 rest:(binary_operation3 expr_op2)* { return operate(first, rest); }
expr_op2
  = first:expr_op1 rest:(binary_operation2 expr_op1)* { return operate(first, rest); }
expr_op1
  = first:real_value rest:(binary_operation1 real_value)* { return operate(first, rest); }

expression_text     // [this is from original grammar; we don't use it.]
  = "[" real_value (binary_operation real_value)* "]" { return {expr:text()}; }

binary_operation
  = binary_operation1 / binary_operation2 / binary_operation3
binary_operation1
  = power
binary_operation2
  = divided_by / modulo / times
binary_operation3
  = and / exclusive_or / minus / non_exclusive_or / plus

power       = "**"  { return Math.pow; }
divided_by  = "/"   { return function div(a,b) { return a / b; } }
modulo      = "mod" { return function mod(a,b) { return a % b; } }
times       = "*"   { return function mul(a,b) { return a * b; } }
and         = "and" { return function and(a,b) { return a && b; } }
xor         = "xor" { return function xor(a,b) { return (!a && b) || (a && !b); } }
minus       = "-"   { return function sub(a,b) { return a - b; } }
or          = "or"  { return function  or(a,b) { return a || b; } }
plus        = "+"   { return function add(a,b) { return a + b; } }
non_exclusive_or = or
exclusive_or = xor

parameter_value
  = "#" idx:parameter_index { return function param() { return options.getValueForParam(idx()); } }
parameter_index
  = real_value
parameter_setting
  = "#" idx:parameter_index "=" val:real_value { return {setting:true, getParam:function () { return idx(); }, getValue:function () { return val(); } } }

unary_combo
  = ordinary_unary_combo / arc_tangent_combo
ordinary_unary_combo
  = op:ordinary_unary_operation x:expression { return function unary() { return op(x()); } }
ordinary_unary_operation
  = absolute_value / arc_cosine / arc_sine / cosine / e_raised_to / fix_down / fix_up / natural_log_of / round / sine / square_root / tangent
arc_tangent_combo
  = atan2:arc_tangent y:expression "/" x:expression { return function atan() { return atan2(y(), x()); } }

absolute_value  = "abs"   { return Math.abs; }
arc_cosine      = "acos"  { return function acosd(x) { return rad2deg * Math.acos(x); } }
arc_sine        = "asin"  { return function asind(x) { return rad2deg * Math.asin(x); } }
cosine          = "cos"   { return function cosd(x) { return Math.cos(x * deg2rad); } }
e_raised_to     = "exp"   { return Math.exp; }
fix_down        = "fix"   { return Math.floor; }
fix_up          = "fup"   { return Math.ceil; }
natural_log_of  = "ln"    { return Math.ln; }
round           = "round" { return Math.round; }
sine            = "sin"   { return function sind(x) { return Math.sin(x * deg2rad); } }
square_root     = "sqrt"  { return Math.sqrt; }
tangent         = "tan"   { return function tand(x) { return Math.tan(x * deg2rad); } }
arc_tangent     = "atan"  { return function atand2(y,x) { return rad2deg * Math.atan2(y,x); } }

comment
  = message / ordinary_comment
message
  = "(" white_space* "M"i white_space* "S"i white_space* "G"i white_space* "," msg:comment_character* ")" { return {message:true, content:msg.join('')} }
ordinary_comment
  = "(" cmt:comment_character* ")" { return {comment:true, content:cmt.join('')} }

digit = [0-9]
mid_line_letter = [abcdfghijklmpqrstxyz]
white_space = [ \t]
comment_character = [^()]     // TODO: "any printable character plus space and tab, except for [parentheses]"
