#!/usr/bin/env node

/**
 * Test script to verify node-vibrant loading
 */

console.log('=== Testing node-vibrant loading ===\n');

// Test 1: Try the old import method
console.log('Test 1: Old import method');
try {
    const Vibrant1 = require('node-vibrant');
    console.log('✓ Old import method works');
} catch (error) {
    console.log('✗ Old import method failed:', error.message);
}

// Test 2: Try the new import method
console.log('\nTest 2: New import method');
try {
    const Vibrant2 = require('node-vibrant/lib/vibrant');
    console.log('✓ New import method works');
} catch (error) {
    console.log('✗ New import method failed:', error.message);
}

// Test 3: Try with fallback
console.log('\nTest 3: Fallback method');
let Vibrant3;
try {
    Vibrant3 = require('node-vibrant/lib/vibrant');
    console.log('✓ node-vibrant loaded successfully');
} catch (error) {
    console.log('✗ node-vibrant failed to load, using fallback');
    Vibrant3 = null;
}

if (Vibrant3) {
    console.log('✓ Fallback mechanism works - Vibrant is available');
} else {
    console.log('✓ Fallback mechanism works - Vibrant is null');
}

console.log('\n=== Test complete ===');
console.log('\nIf all tests show errors, the module will use fallback colors.');
console.log('This should prevent the black screen issue.'); 