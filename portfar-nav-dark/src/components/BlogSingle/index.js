
import React, { Fragment } from 'react';
import {Link} from 'react-router-dom'
import {Dialog, Grid, } from '@material-ui/core'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import'./style.css'


const BlogSingle = ({ maxWidth, open, onClose, title, doc,image1,author,authorName,date}) => {

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
                <Grid className="modalBody modal-body tp-blog-single-section">
                    <div className="tp-blog-content clearfix">
                        <div className="post">
                            <div className="entry-media">
                                <img src={image1} alt="" />
                            </div>
                            <ul className="entry-meta">
                                <li><Link to="/home"><img src={author} alt=""/> By {authorName}</Link></li>
                                <li><Link to="/home"><i className="fa fa-calendar-o" aria-hidden="true"></i>{date}</Link></li>
                            </ul>
                            <h2>{title}</h2>
                            <p>{doc}</p>
                            <p>The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now.</p>
                            <blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. </blockquote>
                            <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now.</p>
                            <p>The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now.</p>
                        </div>

                        <div className="tag-share clearfix">
                            <div className="tag">
                                <ul>
                                    <li><Link to="/home">Design</Link></li>
                                    <li><Link to="/home">Development</Link></li>
                                    <li><Link to="/home">Quality</Link></li>
                                </ul>
                            </div>
                            <div className="share">
                                <ul>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/"><i className="fa fa-facebook"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://twitter.com/"><i className="fa fa-twitter"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/"><i className="fa fa-linkedin"></i></a></li>
                                <li><a target="_blank" rel="noopener noreferrer" href="https://www.pinterest.com/"><i className="fa fa-pinterest"></i></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Grid>
            </Dialog>
        </Fragment>
    );
}
export default BlogSingle

