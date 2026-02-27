/**
 * MQTT Connection Tester
 * Tests multiple MQTT URLs to find the working one for staging
 * 
 * Usage: node test-mqtt-connection.js
 */

const mqtt = require('mqtt');

// List of MQTT URLs to test (in order of likelihood)
const mqttUrls = [
  'wss://mqtt.staging.beamdev.hu:443/mqtt',
  'ws://mqtt.staging.beamdev.hu:9001',
  'wss://staging.beamdev.hu:443/mqtt',
  'ws://staging.beamdev.hu:9001/mqtt',
  'wss://mqtt.staging.beamdev.hu:443/ws',
  'wss://mqtt.staging.beamdev.hu:8883/mqtt',
  'ws://mqtt.staging.beamdev.hu:8080/mqtt',
];

const testConnection = (url) => {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${url}`);
    
    const client = mqtt.connect(url, {
      clientId: `test-client-${Date.now()}`,
      connectTimeout: 5000,
      reconnectPeriod: 0, // Don't auto-reconnect for testing
    });

    const timeout = setTimeout(() => {
      client.end();
      resolve({ url, success: false, error: 'Connection timeout' });
    }, 5000);

    client.on('connect', () => {
      clearTimeout(timeout);
      console.log(`✅ SUCCESS: ${url} is working!`);
      client.end();
      resolve({ url, success: true });
    });

    client.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`❌ FAILED: ${error.message}`);
      resolve({ url, success: false, error: error.message });
    });
  });
};

const testAll = async () => {
  console.log('🚀 Starting MQTT Connection Tests...\n');
  console.log(`Testing ${mqttUrls.length} URLs...\n`);

  for (const url of mqttUrls) {
    const result = await testConnection(url);
    if (result.success) {
      console.log(`\n✅ FOUND WORKING URL: ${result.url}`);
      console.log(`\n📝 Update your .env file with:`);
      console.log(`VITE_MQTT_BROKER_URL=${result.url}\n`);
      return result.url;
    }
  }

  console.log('\n❌ None of the tested URLs worked.');
  console.log('Please check:');
  console.log('1. VPN connection (if required)');
  console.log('2. Network access to staging');
  console.log('3. Contact backend team for correct MQTT URL');
  return null;
};

testAll().then((workingUrl) => {
  if (workingUrl) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
