
import React, { Fragment } from 'react';


import { Dialog, Grid, } from '@material-ui/core'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import VideoModal from '../ModalVideo';
import './style.css'


const PortfolioSingle = ({ maxWidth, open, onClose, title, doc, image1, image2, image3,authorName,videosId,value,date}) => {

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
            <Dialog
                open={open}
                onClose={onClose}
                className="modalWrapper quickview-dialog"
                maxWidth={maxWidth}
            >
                <DialogTitle id="customized-dialog-title" onClose={onClose}>

                </DialogTitle>
                <Grid className="modalBody modal-body">
                    <div className="tp-project-details-area">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="tp-minimal-wrap">
                                        <div className="tp-minimal-img">
                                            <img src={image1} alt="" />
                                            <VideoModal videoId={videosId}/>
                                        </div>
                                        <h2>{title}</h2>
                                    </div>
                                    <div className="tp-project-details-list">
                                        <div className="row">
                                            <div className="co-l-lg-4 col-md-4 col-sm-6 col-12">
                                                <div className="tp-project-details-text">
                                                    <span>Client Name</span>
                                                    <h2>{authorName}</h2>
                                                </div>
                                            </div>
                                            <div className="co-l-lg-4 col-md-4 col-sm-6 col-12">
                                                <div className="tp-project-details-text-3">
                                                    <span>Project Value</span>
                                                    <h2>{value}</h2>
                                                </div>
                                            </div>
                                            <div className="co-l-lg-4 col-md-4 col-sm-6 col-12">
                                                <div className="tp-project-details-text">
                                                    <span>Date</span>
                                                    <h2>{date}</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tp-p-details-section">
                                        <p>{doc}</p>
                                        <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. </p>
                                        <p>It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour,sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined.</p>
                                        <div className="row">
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="tp-p-details-img">
                                                    <img src={image2} alt="" />
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-sm-6 col-12">
                                                <div className="tp-p-details-img">
                                                    <img src={image3} alt="" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tp-p-details-quote">
                                        <p>Sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary net Essential book for you. </p>
                                        <span>{authorName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Grid>
            </Dialog>
        </Fragment>
    );
}
export default PortfolioSingle

