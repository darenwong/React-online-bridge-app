
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import backgroundImg from '../importBackgroundImg.js';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "5%"
  },
  paper: {
    height: 140,
    width: 100,
  },
  control: {
    padding: theme.spacing(2),
  },
}));

function BackgroundSetting(props) {
  const { onClose, open } = props;
  const classes = useStyles();

  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Set Background</DialogTitle>
      <Grid container className={classes.root} direction="row" spacing="3">
          {backgroundImg.map((imgSrc, index) => (
            <Grid key={index} item xs={4}>
              <img alt="bgImg" src={imgSrc} className="backgroundIcon" width="100%" height="auto" onClick={()=>props.setBgImg(imgSrc)}></img>
            </Grid>
          ))}
        </Grid>
    </Dialog>
  );
}
export default BackgroundSetting