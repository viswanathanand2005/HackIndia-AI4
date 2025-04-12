const { enhanceDescription, getQueueStatus } = require('./utils/aiService');
const assert = require('assert');
const { performance } = require('perf_hooks');

// Test cases
const testCases = [
  {
    input: "I make websites",
    expected: /Professional.*websites.*service/i
  },
  {
    input: "graphic design services",
    expected: /Professional.*graphic design.*service/i
  },
  {
    input: "mobile app development",
    expected: /Professional.*app development.*service/i
  },
  {
    input: "", // Empty string
    expected: /Professional service with quality guarantee/
  },
  {
    input: undefined, // Undefined input
    expected: /Professional service with quality guarantee/
  },
  {
    input: 12345, // Non-string input
    expected: /Professional service with quality guarantee/
  }
];

// Run tests
(async () => {
  console.log("Starting description enhancement tests...\n");
  console.log("Initial queue status:", getQueueStatus());

  let successCount = 0;
  const startTime = performance.now();

  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: "${testCase.input}" (${typeof testCase.input})`);
      const testStart = performance.now();
      
      const result = await enhanceDescription(testCase.input);
      const duration = (performance.now() - testStart).toFixed(2);
      
      console.log(`Completed in ${duration}ms`);
      console.log("Original:", testCase.input);
      console.log("Enhanced:", result.enhanced);
      
      // Verify the result
      assert.ok(
        testCase.expected.test(result.enhanced),
        `Output does not match expected pattern: ${testCase.expected}`
      );
      
      if (result.fromCache) {
        console.log("(Served from cache)");
      }
      if (result.isFallback) {
        console.log("(Used basic enhancement)");
      }
      
      successCount++;
      console.log("✅ Test passed");
    } catch (error) {
      console.error(`❌ Test failed for "${testCase.input}":`, error.message);
    }
  }

  // Summary report
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log("\nTest Summary:");
  console.log(`✅ ${successCount} passed`);
  console.log(`❌ ${testCases.length - successCount} failed`);
  console.log(`⏱  Total time: ${totalDuration}s`);
  console.log("\nFinal queue status:", getQueueStatus());

  // Additional stress test
  console.log("\nRunning stress test with 5 rapid requests...");
  const stressTestStart = performance.now();
  const stressResults = await Promise.all([
    enhanceDescription("stress test 1"),
    enhanceDescription("stress test 2"),
    enhanceDescription("stress test 3"),
    enhanceDescription("stress test 4"),
    enhanceDescription("stress test 5")
  ]);
  
  console.log(`Completed in ${((performance.now() - stressTestStart)/1000).toFixed(2)}s`);
  console.log("Queue status after stress test:", getQueueStatus());
})();