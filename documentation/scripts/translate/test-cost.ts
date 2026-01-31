#!/usr/bin/env tsx
/**
 * Test script to check OpenRouter API response structure and cost field
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("❌ OPENROUTER_API_KEY environment variable is required");
  process.exit(1);
}

async function testOpenRouterAPI() {
  const testPrompt = "Translate this short text to French: Hello, how are you?";
  const model = "anthropic/claude-sonnet-4";

  console.log("🧪 Testing OpenRouter API...\n");
  console.log(`Model: ${model}`);
  console.log(`Prompt: ${testPrompt}\n`);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/wsj-br/duplistatus",
        "X-Title": "duplistatus-docs-translator-test",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: testPrompt }],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ API Error: ${response.status}`);
      console.error(error);
      process.exit(1);
    }

    const data = await response.json();

    console.log("📦 Full API Response Structure:\n");
    console.log(JSON.stringify(data, null, 2));

    console.log("\n\n🔍 Cost Field Analysis:\n");
    
    // Check top level
    if (data.cost !== undefined) {
      console.log(`✓ Found cost at top level: ${data.cost}`);
    } else {
      console.log("✗ No cost field at top level");
    }

    // Check usage object
    if (data.usage) {
      console.log(`\n✓ Usage object exists:`);
      console.log(`  - prompt_tokens: ${data.usage.prompt_tokens}`);
      console.log(`  - completion_tokens: ${data.usage.completion_tokens}`);
      console.log(`  - total_tokens: ${data.usage.total_tokens}`);
      
      if (data.usage.cost !== undefined) {
        console.log(`  ✓ Found cost in usage: ${data.usage.cost}`);
      } else {
        console.log(`  ✗ No cost field in usage object`);
      }

      if (data.usage.cost_details) {
        console.log(`  ✓ cost_details exists:`, JSON.stringify(data.usage.cost_details, null, 2));
      } else {
        console.log(`  ✗ No cost_details in usage object`);
      }
    } else {
      console.log("✗ No usage object in response");
    }

    // Check all keys
    console.log("\n📋 All top-level keys:", Object.keys(data));
    if (data.usage) {
      console.log("📋 All usage keys:", Object.keys(data.usage));
    }

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testOpenRouterAPI();
