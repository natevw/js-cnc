start
  = line

line
  = block_delete:"/"? num:line_number? seg:segment*

line_number
  = "N"i digit+

segment
  = mid_line_word / comment / parameter_setting

mid_line_word
  = mid_line_letter real_value

real_value
  = real_number / expression / parameter_value / unary_combo
real_number
  = ("+" / "-")? ((digit+ "."? digit*) / ("." digit+))

expression
  = "[" real_value (binary_operation real_value)* "]"

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
