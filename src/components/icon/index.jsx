import React, {Component} from 'react';
import classNames from 'classnames';
import omit from 'omit.js';
import PropTypes from 'prop-types';
import './style/index.less';

export default class Icon extends Component {
    render() {
        const {type, className = '', spin} = this.props;
        const classes = classNames({
            apolloicon: true,
            'apolloicon-spin': !!spin || type === 'loading',
            [`apolloicon-${type}`]: true
        }, className);
        return <i {...omit(this.props, ['type', 'spin'])} className={classes} />;
    }
}

Icon.propTypes = {
    type: PropTypes.string.isRequired,
    className: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    spin: PropTypes.bool,
    style: PropTypes.object
};
