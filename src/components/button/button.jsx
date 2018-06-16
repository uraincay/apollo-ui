import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from '../icon';
import './style/index.less';

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function isString(str) {
    return typeof str === 'string';
}

// Insert on space between two chinese characters automatically.
function insertSpace(child, needInsert) {
    // Check the child if is undefined or null.
    if (child == null) {
        return;
    }
    const SPACE = needInsert ? ' ' : '';
    // strictNullChecks oops
    if (typeof child !== 'string' && typeof child !== 'number'
        && isString(child.type) && isTwoCNChar(child.props.children)) {
        return React.cloneElement(child, {},
            child.props.children.split('').join(SPACE));
    }
    if (typeof child === 'string') {
        if (isTwoCNChar(child)) {
            child = child.split('').join(SPACE);
        }
        return <span>{child}</span>;
    }
    return child;
}

export default class Button extends Component {
    static __APOLLO_BUTTON = true;

    static defaultProps = {
        prefixCls: 'apollo-btn',
        loading: false
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: props.loading,
            clicked: false,
            hasTwoCNChar: false
        };
    }

    componentDidMount() {
        this.fixTwoCNChar();
    }

    componentWillReceiveProps(nextProps) {
        const currentLoading = this.props.loading;
        const loading = nextProps.loading;

        if (currentLoading) {
            clearTimeout(this.delayTimeout);
        }

        if (typeof loading !== 'boolean' && loading && loading.delay) {
            this.delayTimeout = window.setTimeout(() => {
                this.state({loading});
            }, loading.delay);
        } else {
            this.setState({loading});
        }
    }

    componentDidUpdate() {
        this.fixTwoCNChar();
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.delayTimeout) {
            clearTimeout(this.delayTimeout);
        }
    }

    fixTwoCNChar() {
        const node = findDOMNode(this);
        const buttonText = node.textContent || node.innerText;
        if (this.isNeedInsert() && isTwoCNChar(buttonText)) {
            if (!this.state.hasTwoCNChar) {
                this.setState({
                    hasTwoCNChar: true
                });
            }
        } else if (this.state.hasTwoCNChar) {
            this.setState({
                hasTwoCNChar: false
            });
        }
    }

    handleClick = e => {
        // Add click effect
        this.setState({clicked: true});
        clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.setState({clicked: false}), 500);

        const onClick = this.props.onClick;
        if (onClick) {
            onClick(e);
        }
    }

    isNeedInsert() {
        const {icon, children} = this.props;
        return React.Children.count(children) === 1 && !icon;
    }

    render() {
        const {
            type, shape, size, className, children, icon, prefixCls, loading: _loadingProp, ...rest
        } = this.props;
        const {loading, clicked, hasTwoCNChar} = this.state;
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

        const classes = classNames(prefixCls, className, {
            [`${prefixCls}-${type}`]: type,
            [`${prefixCls}-${shape}`]: shape,
            [`${prefixCls}-${sizeCls}`]: sizeCls,
            [`${prefixCls}-icon-only`]: !children && icon,
            [`${prefixCls}-loading}`]: loading,
            [`${prefixCls}-clicked`]: clicked,
            [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar
        });

        const iconType = loading ? 'loading' : icon;
        const iconNode = iconType ? <Icon type={iconType} /> : null;
        const kids = (children || children === 0)
            ? React.Children.map(children, child => insertSpace(child, this.isNeedInsert())) : null;

        if ('href' in rest) {
            return (
                <a
                    {...rest}
                    className={classes}
                    onClick={this.handleClick}
                >
                    {iconNode}{kids}
                </a>
            );
        }
        // React does not recognize the 'htmlType' prop on a DOM element. Here we pick it out of 'rest'.
        const {htmlType, ...otherProps} = rest;

        return (
            <button
                {...otherProps}
                type={htmlType || 'button'}
                className={classes}
                onClick={this.handleClick}
            >
                {iconNode}{kids}
            </button>
        );
    }
}

export const ButtonSize = PropTypes.oneOf(['large', 'default', 'small']);

Button.propTypes = {
    type: PropTypes.oneOf(['primary', 'normal', 'danger']),
    shape: PropTypes.oneOf(['circle', 'circle-outline']),
    size: ButtonSize,
    htmlType: PropTypes.oneOf(['submit', 'button', 'reset']),
    onClick: PropTypes.func,
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
        delay: PropTypes.number
    })]),
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    icon: PropTypes.string,
    href: PropTypes.string,
    target: PropTypes.string,
    children: PropTypes.element
};
