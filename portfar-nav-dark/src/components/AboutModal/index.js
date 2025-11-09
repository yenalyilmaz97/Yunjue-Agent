
import React, {Fragment} from 'react';


import { Button, Dialog, Grid, } from '@material-ui/core'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Counter from '../Counter'

const DefaultModal = ({ maxWidth, button, buttonClass }) => {
    const [open, setOpen] = React.useState(false);

    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    const styles = (theme) => ({
        root: {
          margin: 0,
          padding: theme.spacing(2),
        },
        closeButton: {
          position: 'absolute',
          right: theme.spacing(1),
          top: theme.spacing(1),
          color: theme.palette.grey[500],
        },
      });

    const DialogTitle = withStyles(styles)((props) => {
        const { children, classes, onClose, ...other } = props;
        return (
          <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
              <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                <i className="fa fa-close"></i>
              </IconButton>
            ) : null}
          </MuiDialogTitle>
        );
      });


    return (
        <Fragment>
            <Button
                className={`btn ${buttonClass}`}
                onClick={handleClickOpen}>
                {button}
                More About
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                className="modalWrapper quickview-dialog"
                maxWidth={maxWidth}
            >
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>

                </DialogTitle>
                <Grid className="modalBody modal-body">
                    <div className="skill-area section-padding">
                        <div className="container">
                            <div className="col-12">
                                <div className="section-title text-center">
                                    <h2>My skills</h2>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 col-sm-6">
                                    <div className="progress yellow">
                                        <span className="progress-left">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <span className="progress-right">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <div className="progress-value">90% <span>Product Design</span></div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="progress blue">
                                        <span className="progress-left">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <span className="progress-right">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <div className="progress-value">80% <span>Web Design</span></div>
                                    </div>
                                </div>
                                
                                <div className="col-md-3 col-sm-6">
                                    <div className="progress pink">
                                        <span className="progress-left">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <span className="progress-right">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <div className="progress-value">65% <span>App Design</span></div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="progress green">
                                        <span className="progress-left">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <span className="progress-right">
                                            <span className="progress-bar"></span>
                                        </span>
                                        <div className="progress-value">47% <span>Visual Design</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Counter/>
                </Grid>
            </Dialog>
        </Fragment>
    );
}
export default DefaultModal

