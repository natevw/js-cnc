{
  function operate(first, rest) {
    if (!rest.length) return first;
    
    var lhs = first,
        next = rest.shift(),
        op = next[0],
        rhs = operate(next[1], rest);
    return {l:lhs, o:op, r:rhs};
    /*
    return function () {
      op(lhs(), rhs());
    };
    */
  }
}


start
  = line

line
  = block_delete:"/"? n:line_number? segs:segment* { return {del:Boolean(block_delete), n:n, segs:segs}; }

line_number
  = "N"i n:$digit+ { return +n; }

segment
  = mid_line_word / comment / parameter_setting

mid_line_word
  = w:mid_line_letter v:real_value { return {word:w,value:(v instanceof Function) ? v() : v}; }

real_value
  = real_number / expression / parameter_value / unary_combo
real_number
  = ("+" / "-")? ((digit+ "."? digit*) / ("." digit+)) { var n = +text(); return n; /*function () { return n; }*/ }

expression
  = expression_recursively

// HT: https://github.com/ryansturmer/node-gcode/blob/b206530251a7a03af3feb0854ba469a06057eaf3/parser.pegjs#L47
expression_recursively
  = "[" expr:expr_op3 "]" { return {expr:expr}; }
expr_op3
  = first:expr_op2 rest:(binary_operation3 expr_op2)* { return operate(first, rest); }
expr_op2
  = first:expr_op1 rest:(binary_operation2 expr_op1)* { return operate(first, rest); }
expr_op1
  = first:real_value rest:(binary_operation1 real_value)* { return operate(first, rest); }

expression_text
  = "[" real_value (binary_operation real_value)* "]" { return {expr:text()}; }
binary_operation
  = binary_operation1 / binary_operation2 / binary_operation3
binary_operation1
  = "**"
binary_operation2
  = "/" / "mod" / "*"
binary_operation3
  = "and" / "xor" / "-" / "or" / "+"



parameter_value
  = "#" parameter_index
parameter_index
  = real_value
parameter_setting
  = "#" parameter_index "=" real_value

unary_combo
  = ordinary_unary_combo / arc_tangent_combo
ordinary_unary_combo
  = ordinary_unary_operation expression
ordinary_unary_operation
  = "abs" / "acos" / "asin" / "cos" / "exp" / "fix" / "fup" / "ln" / "round" / "sin" / "sqrt" / "tan"
arc_tangent_combo
  = "atan" expression "/" expression

comment
  = message / ordinary_comment
message
  = "(" white_space* "M"i white_space* "S"i white_space* "G"i white_space* "," comment_character* ")"
ordinary_comment
  = "(" comment_character* ")"

digit = [0-9]
mid_line_letter = [ABCDFGHIJKLMPQRSTXYZ]i
white_space = [ \t]
comment_character = [^()]     // TODO: "any printable character plus space and tab, except for [parentheses]"
