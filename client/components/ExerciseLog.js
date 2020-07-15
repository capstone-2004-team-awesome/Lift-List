import React, {useState, useEffect} from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Table,
  TableCell
} from '@material-ui/core'

const ExerciseLog = props => {
  // all sets
  const [log, setLog] = useState([])
  const {completedExercise, currentSet} = props

  useEffect(
    () => {
      setLog(exercises => [...exercises, completedExercise])
    },
    [completedExercise]
  )

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5">
              Current Exercise: {currentSet.exerciseName}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exercise</TableCell>
                    <TableCell align="right"># Of Reps</TableCell>
                    <TableCell align="right">Weight (lbs)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{currentSet.exerciseName}</TableCell>
                    <TableCell align="right">{currentSet.reps}</TableCell>
                    <TableCell align="right">{currentSet.weight}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5">Exercise Log</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exercise</TableCell>
                    <TableCell align="right"># Of Reps</TableCell>
                    <TableCell align="right">Weight (lbs)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {log.map(elem => {
                    return (
                      <TableRow key={elem.setId}>
                        <TableCell>{elem.exerciseName}</TableCell>
                        <TableCell align="right">{elem.reps}</TableCell>
                        <TableCell align="right">{elem.weight}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ExerciseLog
