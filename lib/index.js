/**
*
*	STREAM: mean
*
*
*	DESCRIPTION:
*		- Reduce transform stream which calculates the mean of streamed data.
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] 
*
*
*	HISTORY:
*		- 2014/05/21: Created. [AReines].
*
*
*	DEPENDENCIES:
*		[1] stream-combiner
*		[2] flow-reduce
*		[3] flow-map
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. athan@nodeprime.com. 2014.
*
*/

(function() {
	'use strict';

	// MODULES //

	var // Module to combine streams:
		pipeline = require( 'stream-combiner' ),

		// Stream reduce:
		reducer = require( 'flow-reduce' ),

		// Map transform stream:
		mapper = require( 'flow-map' );


	// FUNCTIONS //

	/**
	* FUNCTION: reduce()
	*	Returns a data reduction function.
	*
	* @private
	* @returns {function} data reduction function
	*/
	function reduce() {
		var delta = 0;
		/**
		* FUNCTION: reduce( acc, data )
		*	Defines the data reduction.
		*
		* @private
		* @param {object} acc - accumulation object containing two properties: N, mean. 'N' is the observation number accumulator and 'mean' is the mean accumulator.
		* @param {number} data - numeric stream data
		* @returns {object} accumulation object
		*/
		return function reduce( acc, x ) {
			acc.N += 1;
			delta = x - acc.mean;
			acc.mean += delta / acc.N;
			return acc;
		};
	} // end FUNCTION reduce()

	/**
	* FUNCTION: transform( data )
	*	Defines the data transformation.
	*
	* @private
	* @param {object} data - stream data
	* @returns {number} transformed data
	*/
	function transform( data ) {
		return data.mean;
	} // end FUNCTION transform()


	// STREAM //

	/**
	* FUNCTION: Stream()
	*	Stream constructor.
	*
	* @returns {object} Stream instance
	*/
	function Stream() {
		// Default accumulator values:
		this._value = 0;
		this._N = 0;

		return this;
	} // end FUNCTION stream()

	/**
	* METHOD: value( value )
	*	Setter and getter for initial value from which to begin accumulation. If a value is provided, sets the initial accumulation value. If no value is provided, returns the accumulation value.
	*
	* @param {number} value - initial value
	* @returns {object|number} instance object or initial value
	*/
	Stream.prototype.value = function( value ) {
		if ( !arguments.length ) {
			return this._value;
		}
		if ( typeof value !== 'number' || value !== value ) {
			throw new Error( 'value()::invalid input argument. Initial mean value must be numeric.' );
		}
		this._value = value;
		return this;
	}; // end METHOD value()

	/**
	* METHOD: numValues( value )
	*	Setter and getter for the total number of values the initial value for accumulation represents. If a value is provided, sets the number of values. If no value is provided, returns the number of values.
	*
	* @param {number} value - initial value number
	* @returns {object|number} instance object or initial value number
	*/
	Stream.prototype.numValues = function( value ) {
		if ( !arguments.length ) {
			return this._N;
		}
		if ( typeof value !== 'number' || value !== value ) {
			throw new Error( 'numValues()::invalid input argument. Number of values must be numeric.' );
		}
		this._N = value;
		return this;
	}; // end METHOD numValues()

	/**
	* METHOD: stream()
	*	Returns a JSON data reduction stream for calculating the statistic.
	*/
	Stream.prototype.stream = function() {
		var rStream, tStream, pStream;

		// Create a reduction stream:
		rStream = reducer()
			.reduce( reduce() )
			.acc({
				'mean': this._value,
				'N': this._N
			})
			.stream();

		// Create a map transform stream to extact the mean value:
		tStream = mapper()
			.map( transform )
			.stream();

		// Create a stream pipeline:
		pStream = pipeline(
			rStream,
			tStream
		);

		// Return the pipeline:
		return pStream;
	}; // end METHOD stream()


	// EXPORTS //

	module.exports = function createStream() {
		return new Stream();
	};

})();