// The following tests need to run on their respective order
QUnit.config.reorder = false;

QUnit.module( "<script id='qunit-unescaped-module'>'module';</script>", {
	beforeEach: function() {
	},
	afterEach: function( assert ) {

		// We can't use ok(false) inside script tags since some browsers
		// don't evaluate script tags inserted through innerHTML after domready.
		// Counting them before/after doesn't cover everything either as qunit-modulefilter
		// is created before any test is ran. So use ids instead.
		if ( document.getElementById( "qunit-unescaped-module" ) ) {

			// This can either be from in #qunit-modulefilter or #qunit-testresult
			assert.true( false, "Unescaped module name" );
		}
		if ( document.getElementById( "qunit-unescaped-test" ) ) {
			assert.true( false, "Unescaped test name" );
		}
		if ( document.getElementById( "qunit-unescaped-assertion" ) ) {
			assert.true( false, "Unescaped test name" );
		}
	}
} );

QUnit.test( "<script id='qunit-unescaped-test'>'test';</script>", function( assert ) {
	assert.expect( 1 );
	assert.true( true, "<script id='qunit-unescaped-asassertionsert'>'assertion';</script>" );
} );

QUnit.module( "display test info" );

QUnit.test( "Testing for running class", function( assert ) {
	assert.expect( 1 );

	assert.equal( document.querySelectorAll( ".running" ).length, 1 );
} );

QUnit.test( "running test name displayed", function( assert ) {
	assert.expect( 2 );

	var displaying = document.getElementById( "qunit-testresult" );

	assert.true( /running test name displayed/.test( displaying.innerHTML ),
		"Expect test name to be found in displayed text"
	);
	assert.true( /display test info/.test( displaying.innerHTML ),
		"Expect module name to be found in displayed text"
	);
} );

QUnit.test( "running test suite progress displayed", function( assert ) {
	assert.expect( 1 );

	var displaying = document.getElementById( "qunit-testresult" );

	var expected = /\d+ \/ \d+ tests completed in \d+ milliseconds, with \d+ failed, \d+ skipped, and \d+ todo./;
	assert.true(
		expected.test( displaying.innerHTML ),
		"Expect test suite progress to be found in displayed text"
	);
} );

QUnit.module( "timing", {
	getPreviousTest: function( assert ) {
		return document.getElementById( "qunit-test-output-" + assert.test.testId )
			.previousSibling;
	},
	filterClass: function( elements ) {
		var i;
		for ( i = 0; i < elements.length; i++ ) {
			if ( /(^| )runtime( |$)/.test( elements[ i ].className ) ) {
				return elements[ i ];
			}
		}
	},
	afterEach: function( assert ) {
		var done;
		if ( this.delayNextSetup ) {
			this.delayNextSetup = false;
			done = assert.async();
			setTimeout( function() {
				done();
			}, 101 );
		}
	}
} );

QUnit.test( "setup", function( assert ) {
	assert.expect( 0 );
	this.delayNextSetup = true;
} );

QUnit.test( "basics", function( assert ) {
	assert.expect( 1 );
	var previous = this.getPreviousTest( assert ),
		runtime = this.filterClass( previous.getElementsByTagName( "span" ) );

	assert.true( /^\d+ ms$/.test( runtime.innerHTML ), "Runtime reported in ms" );
} );

QUnit.test( "values", function( assert ) {
	assert.expect( 2 );

	var basics = this.getPreviousTest( assert ),
		setup = basics.previousSibling;

	basics = this.filterClass( basics.getElementsByTagName( "span" ) );
	setup = this.filterClass( setup.getElementsByTagName( "span" ) );

	assert.true( parseInt( basics.innerHTML, 10 ) < 100,
		"Fast runtime for trivial test"
	);
	assert.true( parseInt( setup.innerHTML, 10 ) > 100,
		"Runtime includes beforeEach"
	);
} );

QUnit.module( "source" );

QUnit.test( "setup", function( assert ) {
	assert.expect( 0 );
} );

QUnit.test( "logs location", function( assert ) {
	var previous = document.getElementById( "qunit-test-output-" + assert.test.testId )
		.previousSibling;
	var source = previous.lastChild;
	var err = new Error();

	// Verify QUnit supported stack trace
	if ( !err.stack ) {
		assert.equal(
			/(^| )qunit-source( |$)/.test( source.className ),
			false,
			"Don't add source information on unsupported environments"
		);
		return;
	}

	assert.true( /(^| )qunit-source( |$)/.test( source.className ), "Source element exists" );
	assert.equal( source.firstChild.innerHTML, "Source: " );

	// The file test/reporter-html/reporter-html.js is a direct reference to this test file
	assert.true( /\/test\/reporter-html\/reporter-html\.js:\d+/.test( source.innerHTML ),
		"Source references to the current file and line number"
	);
} );

QUnit.test( "disables autocomplete on module filter", function( assert ) {
	var moduleFilterSearch = document.getElementById( "qunit-modulefilter-search" );

	assert.equal( moduleFilterSearch.autocomplete, "off" );
} );
