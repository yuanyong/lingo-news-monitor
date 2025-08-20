import { checkSemanticDuplicate } from './dedupe';

async function testCheckSemanticDuplicate() {
  const testCases = [
    {
      title: 'Test Case 1: Similar AI news',
      query: 'OpenAI Releases GPT-4 with Enhanced Multimodal Capabilities',
      similarTitles: [
        'GPT-4 Launch: OpenAI Unveils Advanced AI Model with Vision Features',
        'Breaking: OpenAI Announces Major GPT-4 Update',
      ],
      expectedResult: true,
      description: 'Should detect same event with different wording',
    },
    {
      title: 'Test Case 2: Different tech news',
      query: 'Apple Introduces Latest iPhone 15 Pro with AI Features',
      similarTitles: [
        'Tesla Announces New Model Y Updates for 2024',
        'Microsoft Releases Windows 11 Security Update',
      ],
      expectedResult: false,
      description: 'Should not mark different tech news as duplicates',
    },
    {
      title: 'Test Case 3: Similar startup funding news',
      query: 'AI Startup Anthropic Raises $450M in Series C Funding',
      similarTitles: [
        'Anthropic Secures $450 Million in Latest Investment Round',
        'AI Company Anthropic Closes Major Funding Round Led by VCs',
      ],
      expectedResult: true,
      description: 'Should detect same funding news with different angles',
    },
    {
      title: 'Test Case 4: Empty similar titles',
      query: 'Breaking News: SpaceX Launches New Satellite',
      similarTitles: [],
      expectedResult: false,
      description: 'Should handle empty similar titles array',
    }
  ];

  console.log('\nRunning Semantic Duplicate Detection Tests');
  console.log('=========================================');

  for (const testCase of testCases) {
    try {
      console.log(`\n📋 ${testCase.title}`);
      console.log('Description:', testCase.description);
      console.log('\nQuery:', testCase.query);
      console.log('Similar Titles:');
      testCase.similarTitles.forEach(title => console.log(`- ${title}`));
      
      const result = await checkSemanticDuplicate(testCase.query, testCase.similarTitles);
      
      console.log('\nResult:', result ? '✅ Duplicate' : '❌ Not Duplicate');
      console.log('Expected:', testCase.expectedResult ? '✅ Duplicate' : '❌ Not Duplicate');
      console.log('Test Status:', result === testCase.expectedResult ? '🟢 PASS' : '🔴 FAIL');
    } catch (error) {
      console.error(`\n🚨 Error in "${testCase.title}":`, error);
    }
  }
}

// Run the tests
console.log('Starting semantic duplicate detection tests...\n');
testCheckSemanticDuplicate()
  .then(() => console.log('\n✨ All tests completed'))
  .catch((error) => console.error('\n💥 Test suite failed:', error));