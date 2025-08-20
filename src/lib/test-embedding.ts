import { embedText } from './openai';

async function testEmbedding() {
  try {
    const testTexts = [
      'sunny day at the beach',
      '人工智能正在改变世界',
      'The latest developments in quantum computing',
      '今天的股市表现很好',
      'Climate change impacts on global agriculture'
    ];

    for (const text of testTexts) {
      console.log('\n-----------------------------------');
      console.log('Generating embedding for:', text);
      
      const embedding = await embedText(text);
      
      console.log('Embedding results:');
      console.log('Embedding length:', embedding.length);
      console.log('First 5 values:', embedding.slice(0, 5));
    }
    
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Run the test
testEmbedding()
  .then(() => console.log('\nAll tests completed successfully'))
  .catch((error) => console.error('\nTest failed:', error));