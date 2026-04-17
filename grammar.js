module.exports = grammar({
	name: "lsl",

	extras: ($) => [/\s/, $.comment],

	word: ($) => $.identifier,

	rules: {
		source_file: ($) => repeat($._statement),

		// -----------------
		// Statements
		// -----------------
		_statement: ($) =>
			choice(
				$.function_definition,
				$.state_definition,
				$.event_handler,
				$.variable_declaration,
				$.if_statement,
				$.for_statement,
				$.while_statement,
				$.return_statement,
				$.expression_statement,
				$.jump_statement,
			),

		// -----------------
		// States
		// -----------------
		state_definition: ($) =>
			seq(choice("default", "state"), optional($.identifier), $.block),

		// -----------------
		// Control flow
		// -----------------
		if_statement: ($) =>
			prec.right(seq(
				"if",
				"(",
				$.expression,
				")",
				$._body,
				optional(seq("else", $._body)),
			)),

		for_statement: ($) =>
			seq(
				"for",
				"(",
				optional($.expression),
				";",
				optional($.expression),
				";",
				optional($.expression),
				")",
				$._body,
			),

		while_statement: ($) => seq("while", "(", $.expression, ")", $._body),

		// Body of if/for/while: either a block {} or a single statement
		_body: ($) => choice($.block, $._statement),

		return_statement: ($) => seq("return", optional($.expression), ";"),

		jump_statement: ($) => seq(choice("jump", "state"), $.identifier, ";"),

		// -----------------
		// Functions
		// -----------------
		function_definition: ($) =>
			seq(
				$.type,
				$.identifier,
				"(",
				optional($.parameter_list),
				")",
				$.block,
			),

		parameter_list: ($) => seq($.parameter, repeat(seq(",", $.parameter))),

		parameter: ($) => seq($.type, $.identifier),

		// -----------------
		// Variables
		// -----------------
		variable_declaration: ($) =>
			seq($.type, $.identifier, optional(seq("=", $.expression)), ";"),

		// -----------------
		// Expressions
		// -----------------
		expression_statement: ($) => seq($.expression, ";"),

		expression: ($) =>
			choice(
				$.assignment,
				$.binary_expression,
				$.cast_expression,
				$.call_expression,
				$.vector_literal,
				$.rotation_literal,
				$.list_literal,
				$.constant,
				$.identifier,
				$.number,
				$.string,
			),

		vector_literal: ($) =>
			seq("<", $.expression, ",", $.expression, ",", $.expression, ">"),

		rotation_literal: ($) =>
			seq("<", $.expression, ",", $.expression, ",", $.expression, ",", $.expression, ">"),

		list_literal: ($) =>
			seq("[", optional(seq($.expression, repeat(seq(",", $.expression)))), "]"),

		assignment: ($) => seq($.identifier, "=", $.expression),

		cast_expression: ($) => seq("(", $.type, ")", $.expression),

		binary_expression: ($) =>
			prec.left(
				1,
				seq(
					$.expression,
					choice(
						"+", "-", "*", "/", "%",
						"==", "!=", "<", ">", "<=", ">=",
						"&&", "||",
						"&", "|", "^", "~",
						"<<", ">>",
					),
					$.expression,
				),
			),

		call_expression: ($) =>
			seq(
				field("function", choice($.lsl_function, $.ossl_function, $.identifier)),
				"(",
				optional($.argument_list),
				")",
			),

		argument_list: ($) => seq($.expression, repeat(seq(",", $.expression))),

		block: ($) => seq("{", repeat($._statement), "}"),

		// -----------------
		// Tokens
		// -----------------
		type: ($) =>
			choice(
				"integer",
				"float",
				"string",
				"key",
				"vector",
				"rotation",
				"list",
			),

		constant: ($) =>
			choice(
				"TRUE",
				"FALSE",
				"NULL_KEY",
				"ZERO_VECTOR",
				"ZERO_ROTATION",
				"PI",
				"TWO_PI",
				"PI_BY_TWO",
				// Change flags
				"CHANGED_OWNER",
				"CHANGED_REGION_START",
			),

		// -----------------
		// LSL built-in functions (ll* prefix)
		// -----------------
		lsl_function: ($) =>
			choice(
				"llDetectedKey",
				"llRegionSayTo",
				"llResetScript",
				"llWhisper",
			),

		// -----------------
		// OSSL built-in functions (os* prefix)
		// -----------------
		ossl_function: ($) =>
			choice(
				"osTeleportAgent",
			),

		event_handler: ($) =>
			seq($.event_name, "(", optional($.parameter_list), ")", $.block),

		event_name: ($) =>
			choice(
				"state_entry",
				"state_exit",
				"touch_start",
				"touch",
				"touch_end",
				"collision_start",
				"collision",
				"collision_end",
				"listen",
				"timer",
				"changed",
				"on_rez",
				"attach",
				"dataserver",
				"run_time_permissions",
				"sensor",
				"no_sensor",
				"control",
				"money",
				"email",
				"http_response",
				"path_update",
			),

		identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

		number: ($) => /\d+(\.\d+)?/,

		string: ($) => /"([^"\\]|\\.)*"/,

		comment: ($) =>
			token(
				choice(
					seq("//", /.*/),
					seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
				),
			),
	},
});
