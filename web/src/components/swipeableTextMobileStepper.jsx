import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import SwipeableViews from 'react-swipeable-views';
import introImg from '../importIntroImg';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 400,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 'var(--btn-font-size) !important',
  },
  img: {
    display: 'block',
    maxWidth: 400,
    width: '100%',
    padding: '10px',
    borderRadius: '3vh',
  },
  stepper:{
    backgroundColor: 'rgba(255,255,255,0)',
    justifyContent: 'center',
    borderRadius: '1vh',
    overflow: 'visible'
  },
  dot:{
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive:{
    backgroundColor: 'red',
  }
}));

function SwipeableTextMobileStepper() {
  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = introImg.length;

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <div className={classes.root}>
      <Paper square elevation={0} className={classes.header}>
        {introImg[activeStep].label}
      </Paper>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {introImg.map((step, index) => (
          <div key={step.label}>
            {Math.abs(activeStep - index) <= 2 ? (
              <img className={classes.img} src={step.imgPath} alt={step.label} />
            ) : null}
          </div>
        ))}
      </SwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position="static"
        variant="dots"
        activeStep={activeStep}
        classes={{root: classes.stepper, dot: classes.dot, dotActive: classes.dotActive}}
      />
    </div>
  );
}

export default SwipeableTextMobileStepper;