import React, {Component} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {ButtonSize} from './button';

export default class ButtonGroup extends Component {
    render() {
        const {
            prefixCls = 'apollo-btn-group',
            size,
            className,
            ...others
        } = this.props;

        // large => lg
        // small => sm
        let sizeCls = '';
        switch (size) {
            case 'large':
                sizeCls = 'lg';
                break;
            case 'small':
                sizeCls = 'sm';
                break;
            default:
                break;
        }

        const classes = classNames(prefixCls, {
            [`${prefixCls}-${sizeCls}`]: sizeCls
        }, className);

        return <div {...others} className={classes} />;
    }
}

ButtonGroup.propTypes = {
    size: ButtonSize,
    style: PropTypes.object,
    className: PropTypes.string,
    prefixCls: PropTypes.string
};
