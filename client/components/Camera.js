import React, {useState} from 'react'
import {Button, Card, Grid} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  button: {
    [theme.breakpoints.up('sm')]: {
      width: '2rem'
    },
    [theme.breakpoints.down('sm')]: {
      width: '1rem'
    },
    padding: '3px 8px'
  }
}))

const Camera = props => {
  const classes = useStyles()
  const {stop, init, model, webcam} = props
  const [hasWebcamStarted, setHasWebcamStarted] = useState(false)
  const [isWebcamPaused, setIsWebcamPaused] = useState(false)

  const start = () => {
    setHasWebcamStarted(true)
    init()
  }

  const play = async () => {
    setIsWebcamPaused(false)
    await webcam.play()
  }

  const pause = async () => {
    setIsWebcamPaused(true)
    await webcam.pause()
  }

  return (
    <Card style={{width: '100%'}}>
      {model ? (
        <Grid
          container
          item
          spacing={1}
          justify="center"
          style={{paddingTop: '1rem'}}
        >
          {!hasWebcamStarted ? (
            <Grid item>
              <Button
                type="button"
                onClick={() => start()}
                className={classes.button}
              >
                Start
              </Button>
            </Grid>
          ) : (
            <React.Fragment>
              {!isWebcamPaused ? (
                <Grid item>
                  <Button
                    type="button"
                    onClick={() => pause()}
                    className={classes.button}
                  >
                    Pause
                  </Button>
                </Grid>
              ) : (
                <Grid item>
                  <Button
                    type="button"
                    onClick={() => play()}
                    className={classes.button}
                  >
                    Play
                  </Button>
                </Grid>
              )}
              <Grid item>
                <Button
                  type="button"
                  onClick={() => stop()}
                  className={classes.button}
                >
                  Stop
                </Button>
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      ) : null}

      <div style={{paddingTop: '1rem'}}>
        <canvas id="canvas" />
      </div>
      <div id="label-container" style={{paddingTop: '1rem'}} />
    </Card>
  )
}

export default Camera
