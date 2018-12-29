const say = require('say')

streamingMicRecognize()

function streamingMicRecognize() {
  // [START speech_transcribe_streaming_mic]
  const record = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  const encoding = 'LINEAR16';
  const sampleRateHertz = 16000;
  const languageCode = 'en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', function (data) {
      record.stop()
      recieveTranslation(data)
    });

  // Start recording and send the microphone input to the Speech API
  record
    .start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      silence: '10.0',
    })
    .on('error', console.error)
    .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
  // [END speech_transcribe_streaming_mic]
}


function recieveTranslation (data) {
  consoleLogTranscript(data)
  formResponse(data.results[0].alternatives[0].transcript)
}

function consoleLogTranscript (data) {
  process.stdout.write(
    data.results[0] && data.results[0].alternatives[0]
      ? `WHAT LOOPY HEARS:\n${data.results[0].alternatives[0].transcript}\n`
      : `\n\nReached transcription time limit, press Ctrl+C\n`
  )
}

function formResponse (transcript) {
  console.log("WHAT LOOPY SAYS:");
  var initialBridge = transcript.match('feel')
    ? "I hear you're feeling "
    : "I hear you say "
  var response =
    initialBridge
    + transcript
      .split(/(feel\w*)/).pop()
      .replace(/\bI am\b/ig, "you are")
      .replace(/\bI'm\b/ig, "you are")
      .replace(/\bmy\b/ig, "your")
      .replace(/\bI\b/ig, "you")
      .replace(/\bme\b/ig, "you")
      .replace(/\bLoopy\b/ig, "")
      .replace(/\bthanks\b/ig, "an absolute pleasure my friend")
  console.log(response);
  console.log("");
  say.speak(response, 'Veena', 1.0, streamingMicRecognize)
}


// =============================================================================
// PLAYING WITH THE INBUILT TEXT TO SPEECH CAPABILITIES
// =============================================================================

// say.speak("What's up susie?", 'Alex', 0.5)
// macVoices = ["Alex", "Fred", "Victoria", "Samantha", "Daniel", "Tessa", "Fiona", "Moira", "Veena", "Karen"]

// listVoices(macVoices)

// say.speak("I'm sorry Dave, I cannot allow that", 'Alex', 1.0)
//
// function listVoices(voices) {
//   if (voices.length == 0) return
//   console.log(voices[0]);
//   console.log("Hi, my name is " + voices[0])
//   say.speak(
//     "Hi, my name is " + voices[0],
//     voices[0],
//     2.0,
//     () => {listVoices(voices.filter(shrinkVoiceArrayByOne))}
//   )
// }
//
// function shrinkVoiceArrayByOne (voice, index) {
//   return index > 0
// }
