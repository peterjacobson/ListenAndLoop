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
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', recieveTranslation);

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
  formResponse(data)
}

function consoleLogTranscript (data) {
  process.stdout.write(
    data.results[0] && data.results[0].alternatives[0]
      ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
      : `\n\nReached transcription time limit, press Ctrl+C\n`
  )
}



function formResponse (data) {

  var response =
    "I hear that " +
    data.results[data.results.length-1].alternatives[0].transcript
      .split(/(feel\w*)/).pop()
      .replace(/my/ig, "your")
      .replace(/I/ig, "you")
      .replace(/me/ig, "you")
      .replace(/I am/ig, "you are")
      .replace(/I'm/ig, "you're")
      .replace(/Loopy/ig, "")
  console.log(response);
  say.speak(response, 'Alex', 1.0)
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
