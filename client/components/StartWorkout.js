/* eslint-disable complexity */
import React, {useState, useEffect} from 'react'
import Camera from './Camera'
import {Grid} from '@material-ui/core'
import ExerciseLog from './ExerciseLog'
import * as tmPose from '@teachablemachine/pose'
import axios from 'axios'
import {connect} from 'react-redux'

const StartWorkout = props => {
  const [currentSet, setCurrentSet] = useState({
    exerciseName: '',
    exerciseId: '',
    reps: '',
    weight: '',
    time: '',
    setId: ''
  })

  const [completedExercise, setCompletedExercise] = useState({})
  const [webcam, setWebcam] = useState(null)
  const [model, setModel] = useState(null)
  let setLogger = {}

  let ctx, labelContainer, maxPredictions
  let lastPrediction = {
    'Bicep Curl': false,
    Squat: false
  }
  let predictionTracker = {
    'Bicep Curl': false,
    Squat: false
  }

  // Teachable Machine API Functions:
  // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

  useEffect(() => {
    async function loadModel() {
      // load the model and metadata
      // Note: the pose library adds a tmPose object to your window (window.tmPose)
      // the link to our Teachable Machine model
      const URL = 'https://teachablemachine.withgoogle.com/models/ByPivKL7e/'
      const modelURL = URL + 'model.json'
      const metadataURL = URL + 'metadata.json'
      const loadedModel = await tmPose.load(modelURL, metadataURL)
      setModel(loadedModel)
    }
    loadModel()
  }, [])

  useEffect(() => {
    const defineWebcam = () => {
      // setup a webcam
      setWebcam(new tmPose.Webcam(300, 300, true)) // width, height, flip
    }
    defineWebcam()
  }, [])

  async function init() {
    maxPredictions = model.getTotalClasses()
    // Convenience function to setup a webcam
    await webcam.setup() // request access to the webcam from user
    webcam.play()
    window.requestAnimationFrame(loop)

    // append/get elements to the DOM
    const canvas = document.getElementById('canvas')
    // canvas.width = size
    canvas.height = canvas.width
    ctx = canvas.getContext('2d')
    labelContainer = document.getElementById('label-container')
    for (let i = 0; i < maxPredictions; i++) {
      // and class labels
      labelContainer.appendChild(document.createElement('div'))
    }
  }

  async function loop() {
    webcam.update() // update the webcam frame
    await predict()
    window.requestAnimationFrame(loop)
  }

  async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const {pose, posenetOutput} = await model.estimatePose(webcam.canvas)
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput)
    // *** prediction object sample:
    // prediction = [{className: "Neutral - Standing", probability: 1.1368564933439103e-15},
    //              {className: "Bicep Curl - Up ", probability: 1}]

    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
        prediction[i].className + ': ' + prediction[i].probability.toFixed(2)
      labelContainer.childNodes[i].innerHTML = classPrediction
      if (prediction[i].probability > 0.95) {
        predictionTracker[prediction[i].className] = true
      } else {
        predictionTracker[prediction[i].className] = false
      }
    }

    for (let exercise in predictionTracker) {
      // *** if exercise boolean value has switched, make API call (exerciseId), to increase reps
      if (!exercise.includes('Neutral')) {
        if (
          lastPrediction[exercise] === false &&
          predictionTracker[exercise] === true
        ) {
          if (!setLogger.exerciseId) {
            // CREATE NEW SET
            const {data} = await axios.post(
              `/api/exercise/create/${exercise}/${props.userId}`
            )
            const [exerciseInfo, setInfo] = data
            setLogger = {
              exerciseName: exerciseInfo.name,
              exerciseId: exerciseInfo.id,
              reps: setInfo.reps,
              weight: setInfo.weight,
              updatedAt: setInfo.updatedAt,
              setId: setInfo.id
            }
          } else if (exercise === setLogger.exerciseName) {
            // INCREMENT REPS IF SAME EXERCISE IS REPEATED
            const {data} = await axios.put(
              `/api/exercise/update/${setLogger.exerciseId}/${props.userId}`
            )
            setLogger = {...setLogger, reps: data.reps}
          } else {
            // MARK PREVIOUS SET AS COMPLETE AND CREATE NEW SET IF NEW EXERCISE IS BEING DONE
            await axios.put(`/api/exercise/complete/${props.userId}`)
            setCompletedExercise(setLogger)
            const {data} = await axios.post(
              `/api/exercise/create/${exercise}/${props.userId}`
            )
            const [exerciseInfo, setInfo] = data
            setLogger = {
              exerciseName: exerciseInfo.name,
              exerciseId: exerciseInfo.id,
              reps: setInfo.reps,
              weight: setInfo.weight,
              updatedAt: setInfo.updatedAt,
              setId: setInfo.id
            }
          }
          setCurrentSet({
            exerciseName: exercise,
            exerciseId: setLogger.exerciseId,
            reps: setLogger.reps,
            weight: setLogger.weight,
            time: setLogger.updatedAt,
            setId: setLogger.setId
          })
        }
      }
    }

    // finally draw the poses
    drawPose(pose)
    lastPrediction = {...predictionTracker}
  }

  function drawPose(pose) {
    if (webcam.canvas) {
      ctx.drawImage(webcam.canvas, 0, 0)
      // draw the keypoints and skeleton
      if (pose) {
        const minPartConfidence = 0.5
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx)
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx)
      }
    }
  }

  const stop = async () => {
    // STOP CAMERA AND MARK THE LAST SET DONE AS COMPLETE
    await axios.put(`/api/exercise/complete/${props.userId}`)
    await webcam.stop()
    // redirect to workout summary page
    props.history.push('/summary')
  }

  return (
    <div>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Camera init={init} stop={stop} model={model} webcam={webcam} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <ExerciseLog
            currentSet={currentSet}
            completedExercise={completedExercise}
          />
        </Grid>
      </Grid>
    </div>
  )
}

const mapState = state => {
  return {
    userId: state.user.id
  }
}

export default connect(mapState)(StartWorkout)
