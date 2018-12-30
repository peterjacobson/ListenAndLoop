const say = require('say')
const language = require('@google-cloud/language');
const util = require('util')

function analyseTranscription(transcript, question) {
  // Instantiates a client
  const client = new language.LanguageServiceClient();

  const document = {
    content: transcript,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the text
  client
    .analyzeSentiment({document: document})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      console.log(util.inspect(results, false, null, true))
      console.log(util.inspect(results[0].sentences[0].text.content, false, null, true))
      console.log(JSON.stringify(results, null, 4));
      console.log(JSON.stringify(results[0].sentences[0].text.content, null, 4));
      // console.log(`Text: ${transcript}`);
      // console.log(`Sentiment score: ${sentiment.score}`);
      // console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
      // console.log(`analysis: ${sentiment}`);
      receiveAnalysedTranscript(transcript, question, results)
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}


// streamingMicRecognize()

askQuestionAndOpenMic("Hey, what's up?")

function askQuestionAndOpenMic(question1, question2) {
  say.speak(question1, 'Alex', 1.5, streamingMicRecognize(question2))
}

function streamingMicRecognize(question) {
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
      analyseTranscription(data, question)
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


function receiveAnalysedTranscript (data, question, analysis) {
  var transcription = data.results[0].alternatives[0].transcript
  if (transcription.match(/(you)/)) return abrasiveResponse(transcription)
  if (transcription.match(/(feel)/)) return feelingResponse(transcription)
  if (transcription.match(/(I)(me)/)) return selfReflectiveResponse(transcription)
  consoleLogTranscript(data)
  return abrasiveResponse(data.results[0].alternatives[0].transcript)
}

function consoleLogTranscript (data) {
  process.stdout.write(
    data.results[0] && data.results[0].alternatives[0]
      ? `WHAT LOOPY HEARS:\n${data.results[0].alternatives[0].transcript}\n`
      : `\n\nReached transcription time limit, press Ctrl+C\n`
  )
}

function abrasiveResponse(transcript) {
  var initialBridge = "No, you"
  var end = "! "
  var protagonise = ["Why don't you just calm down.", "How about a nice hot cup of shut the fuck up?", "Harden up, you shrimp", "Jeez, take a chill pill.", "Tell it to your mother", "Go stick your head in a drainpipe, pencilhead"]
  var randomBait = protagonise[Math.floor(Math.random()*protagonise.length)]
  var response =
    initialBridge
    + transcript
      .split(/(you\w*)/).pop()
    + end
    + randomBait
  console.log(response);
  console.log("");
  say.speak(response, 'Alex', 1.5, streamingMicRecognize)
}

function counselling (transcript) {
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
  say.speak(response, 'Alex', 1.0, streamingMicRecognize)
}


// =============================================================================
// PLAYING WITH THE INBUILT TEXT TO SPEECH CAPABILITIES
// =============================================================================

// say.speak("What's up susie?", 'Alex', 0.5)
// macVoices = ["Alex", "Fred", "Victoria", "Samantha", "Daniel", "Tessa", "Fiona", "Moira", "Veena", "Karen"]
//
// listVoices(macVoices)
//
// function listVoices(voices) {
//   if (voices.length == 0) return
//   console.log(voices[0]);
//   console.log("Hi, my name is " + voices[0])
//   say.speak(
//     "Hi, my name is " + voices[0],
//     voices[0],
//     1.0,
//     () => {listVoices(voices.filter(shrinkVoiceArrayByOne))}
//   )
// }
//
// function shrinkVoiceArrayByOne (voice, index) {
//   return index > 0
// }
