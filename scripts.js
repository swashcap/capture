(function() {

/* ------------------------------------------------------------------------
   ================================ SETUP =================================
   ------------------------------------------------------------------------ */

var h = document.getElementsByTagName( "html" )[ 0 ];
h.className = h.className.replace( "no-js", "js" ); // For js-enabled browsers

/* Google Analytics */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-23423115-1']);
_gaq.push(['_trackPageview']);

var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

/* Typekit */

var config = {
  kitId: 'uwd4jyr',
  scriptTimeout: 3000
};
h.className+=" wf-loading";
var t=setTimeout(function(){h.className=h.className.replace(/(\s|^)wf-loading(\s|$)/g," ");h.className+=" wf-inactive"},config.scriptTimeout);var tk=document.createElement("script"),d=false;tk.src='//use.typekit.net/'+config.kitId+'.js';tk.type="text/javascript";tk.async="true";tk.onload=tk.onreadystatechange=function(){var a=this.readyState;if(d||a&&a!="complete"&&a!="loaded")return;d=true;clearTimeout(t);try{Typekit.load(config)}catch(b){}};var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(tk,s)

/* Add a `repeat()` method to strings that
 * repeats the preceding string by the
 * number passed.
 * http://stackoverflow.com/a/202627
 */

String.prototype.repeat = function( num ) {
	return new Array( num + 1 ).join( this );
}

/* ------------------------------------------------------------------------
   =============================== CAPTURE ================================
   ------------------------------------------------------------------------ */

var primary = document.getElementById( "primary" ), // #primary, classes
    input   = document.getElementById( "input" ),   // Input <textarea>
    submit  = document.getElementById( "submit" ),  // Submit button
    output  = document.getElementById( "output" ),  // Output <textarea>
    display = document.getElementById( "display" ); // Output <div> (for display)

/* Store the regular expressions and their return
 * strings (with callbacks) in an array. For each
 * an individual regular expression, this is:
 *
 *     Array( [regex], [return] )
 *
 * Then use a `for` loop on each individual array
 * to filter the input to this effect:
 *
 *     input = input.replace( [regex], [return] )
 */

var regexes = new Array(
	/* Headings */
		Array( /(^|\n)[#]{6} +([\S ]+)\n/gm, "$1<h6>$2</h6>\n" ), // h6
		Array( /(^|\n)[#]{5} +([\S ]+)\n/gm, "$1<h5>$2</h5>\n" ), // h5
		Array( /(^|\n)[#]{4} +([\S ]+)\n/gm, "$1<h4>$2</h4>\n" ), // h4
		Array( /(^|\n)[#]{3} +([\S ]+)\n/gm, "$1<h3>$2</h3>\n" ), // h3
		Array( /(^|\n)[#]{2} +([\S ]+)\n/gm, "$1<h2>$2</h2>\n" ), // h2
		Array( /(^|\n)[#]{1} +([\S ]+)\n/gm, "$1<h1>$2</h1>\n" ), // h1

	/* Unordered Lists */
		Array( /\n\n(\*|\+|-){1}([ |\t]+)/gm, "\n\n<ul>\n$1$2" ), // Opening <ul>
		Array( /\n(\*|\+|-){1}([ |\t]+)([\S ]+)\n\n/gm, "\n$1$2$3\n</ul>\n\n" ), // Closing </ul>
		Array( /\n[\*|\+|-]{1}[ |\t]+([\S ]+)/gm, "\n<li>$1</li>" ), // <li>

	/* Ordered Lists */
		Array( /\n\n(\d+\.)([ |\t]+)/gm, "\n\n<ol>\n$1$2" ), // Opening <ol>
		Array( /\n(\d+\.)([ |\t]+)([\S ]+)\n\n/gm, "\n$1$2$3\n</ol>\n\n" ), // Closing </ol>
		Array( /\n(\d+\.)([ |\t]+)([\S ]+)/gm, "\n<li>$3</li>" ), // <li>

	/* Horizontal Rules */
		Array( /(^|\n)[-\*_ ]{3,}\n/gm, "\$1<hr />\n" ), // <hr>

	/* Code Blocks */
		Array( /\n{2}( {4}|\t)([\S]+)/gm, "\n\n<pre>\n$1$2" ), // Opening <pre>
		Array( /\n( {4}|\t)([^\n]+)\n{2}/gm, "\n$1$2\n</pre>\n\n" ),	// Closing </pre>
		Array( /( {4}|\t)([^\n]*)/gm, "<code>$2</code>" ), // Wrap <code />

		Array( /<\/code>\n<code>/gm, "\n" ), // Strip extra `code` tags
		Array( /<pre>\s+<code>/gm, "<pre><code>" ),
		Array( /<\/code>\s+<\/pre>/gm, "</code></pre>" ),

	/* Paragraphs */
		Array( /(^|\n)(?![<| {4}|\t])([\S ]+)/gm, "$1<p>$2</p>" ), // <p>

	/* Links */
		Array( /\[([\S ]+)\]\( *([\w\-_\.~\!\*;:@&\=\+\$\,\/\?%#]+) +"([\S ]+)" *\)/gm, "<a href=\"$2\" title=\"$3\">$1</a>" ), // [name](url "title")
		Array( /\[([\S ]+)\]\( *([\w\-_\.~\!\*;:@&\=\+\$\,\/\?%#]+) *\)/gm, "<a href=\"$2\">$1</a>" ), // [name](url)

	/* Strong */
		Array( /(\*|_){2}([\S ]+)(\*|_){2}/gm, "<strong>$2</strong>" ), // Wrap <strong />

	/* Emphasis */
		Array( /(\*|_){1}([\S ]+)(\*|_){1}/gm, "<em>$2</em>" ), // Wrap <em />

	/* Code */
		Array( /`{1}([\S ]+)`{1}/gm, "<code>$1</code>" ) // Wrap <code />
);

if ( document.addEventListener ) {
	input.addEventListener( "keydown", keyDetect );
	submit.addEventListener( "click", processInput );
}
else if ( document.attachEvent ) {
	input.attachEvent( "keydown", keyDetect );
	submit.attachEvent( "click" , processInput );
}

function keyDetect() {
	setState();
	if ( document.removeEventListener ) {
		input.removeEventListener( "keydown", keyDetect );
	}
	else if ( document.detachEvent ) {
		input.detachEvent( "keydown", keyDetect );
	}
}

function processInput() {

	var input = document.getElementById( "input" ).value;

	/* Blockquotes */

	/* This method is a little hack-y. We split out
	 * lines, wrap them with `<blockquote />`s,
	 * then strip all the unnecessary nested tags.
	 */

	var blockTest = /(^|\n)>/gm; // Check for blockquotes

	if ( blockTest.test( input ) ) {

		var blockMatch, blockOpen, blockClose, blockNest, blockCount;

		blockMatch = />( {1,4}|\t)/g; // Single block match
		blockOpen = "<blockquote>\n"; // Opening tag
		blockClose = "\n</blockquote>"; // Closing tag
		blockNest = 0; // Counter used for cleanup

		var lines = input.split( "\n" );
		for (
			var i = 0, il = input.length;
			i < il;
			i++
		) {
			if (
				typeof lines[ i ] !== "undefined" &&
				lines[ i ].match( blockMatch )
			) {
				blockCount = lines[ i ].match( blockMatch ).length; // Count of nested blockquotes
				
				blockNest = ( blockCount > blockNest ) ? blockCount : blockNest;
				
				lines[ i ] += blockClose.repeat( blockCount ); // Add closing
				lines[ i ] = lines[ i ].replace( blockMatch, blockOpen ); // Replace opening
			}
			else if (
				typeof lines[ i ] !== "undefined" &&
				lines[ i ].match( blockTest )
			) {
				lines[ i ] = ""; // Remove ">" lines
			}
		}
		input = lines.join( "\n" ); // Put lines together
		
		/* Clean up */

		var tempRegex;
		while ( blockNest > 0 ) { 
			tempRegex = new RegExp( '(' + blockClose + '){' + blockNest + '}[\\s]*(' + blockOpen + '){' + blockNest + '}', 'gm' );
			input = input.replace( tempRegex, "\n" );

			blockNest--;
		}
	}

	for (
		var i = 0, il = regexes.length;
		i < il;
		i++
	) {
		input = input.replace( regexes[ i ][ 0 ], regexes[ i ][ 1 ] );
	}

	vomit( input ); // Dump it
	setState( "converted" );

}

	function setState( state ) {
		/* Add classes to `#primary` depending on
		 * the current state. Use:
		 *
		 *     `.empty`     for intial state
		 *     ``           for processing state
		 *     `.converted` for processed state
		 */

		state = state || "";
		primary.className = state;
	}
	function vomit( content ) {
		/* Equivalent of an "output" or "print"
		 * function, `vomit()` dumps what it's
		 * passed into `<textarea id="output">`
		 * and `<div id="display>".
		 */
		output.value = content;

		display.innerHTML = content;
	}
})();