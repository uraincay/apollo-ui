/* eslint-disable no-mixed-operators */
/* eslint-disable no-restricted-globals */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Pager from './Pager';
import './style/index.less';

function noop() {
}

function isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

function defaultItemRender(page, type, element) {
    return element;
}

export default class Pagination extends Component {
    static defaultProps = {
        hideOnSinglePage: false,
        prefixCls: 'apollo-pagination',
        showLessItems: false,
        showPrevNextJumpers: true,
        defaultCurrent: 1,
        total: 0,
        defaultPageSize: 10,
        onChange: noop,
        style: {},
        className: '',
        itemRender: defaultItemRender
    };

    constructor(props) {
        super(props);

        const hasOnChange = props.onChange !== noop;
        const hasCurrent = ('current' in props);
        if (hasCurrent && !hasOnChange) {
            console.warn('Warning: You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.'); // eslint-disable-line
        }

        let current = props.defaultCurrent;
        if ('current' in props) {
            current = props.current;
        }

        let pageSize = props.defaultPageSize;
        if ('pageSize' in props) {
            pageSize = props.pageSize;
        }

        this.state = {
            current,
            pageSize
        };
    }

    componentWillReceiveProps(nextProps) {
        if ('current' in nextProps) {
            this.setState({
                current: nextProps.current
            });
        }

        if ('pageSize' in nextProps) {
            const newState = {};
            let current = this.state.current;
            const newCurrent = this.calculatePage(nextProps.pageSize);
            current = current > newCurrent ? newCurrent : current;
            if (!('current' in nextProps)) {
                newState.current = current;
            }
            newState.pageSize = nextProps.pageSize;
            this.setState(newState);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // When current page change, fix focused style of prev item
        // A hacky solution of https://github.com/ant-design/ant-design/issues/8948
        const {prefixCls} = this.props;
        if (prevState.current !== this.state.current && this.paginationNode) {
            const lastCurrentNode = this.paginationNode.querySelector(
                `.${prefixCls}-item-${prevState.current}`
            );
            if (lastCurrentNode && document.activeElement === lastCurrentNode) {
                lastCurrentNode.blur();
            }
        }
    }

    getJumpPrevPage() {
        const {current, showLessItems} = this.state;
        return Math.max(1, current - (showLessItems ? 3 : 5));
    }

    getJumpNextPage() {
        const {current, showLessItems} = this.state;
        return Math.min(this.calculatePage(), current + (showLessItems ? 3 : 5));
    }

    savePaginationNode = node => {
        this.paginationNode = node;
    }

    calculatePage = p => {
        let pageSize = p;
        if (typeof pageSize === 'undefined') {
            pageSize = this.state.pageSize;
        }
        return Math.floor((this.props.total - 1) / pageSize) + 1;
    }

    isValid = page => (isInteger(page) && page >= 1 && page !== this.state.current);

    handleChange = p => {
        let page = p;
        if (this.isValid(page)) {
            if (page > this.calculatePage()) {
                page = this.calculatePage();
            }

            if (!('current' in this.props)) {
                this.setState({
                    current: page
                });
            }

            const pageSize = this.state.pageSize;
            this.props.onChange(page, pageSize);

            return page;
        }

        return this.state.current;
    };

    prev = () => {
        if (this.hasPrev()) {
            this.handleChange(this.state.current - 1);
        }
    }

    next = () => {
        if (this.hasNext()) {
            this.handleChange(this.state.current + 1);
        }
    }

    jumpPrev = () => {
        this.handleChange(this.getJumpPrevPage());
    }

    jumpNext = () => {
        this.handleChange(this.getJumpNextPage());
    }

    hasPrev = () => this.state.current > 1;


    hasNext = () => this.state.current < this.calculatePage();

    runIfEnter = (event, callback, ...restParams) => {
        if (event.key === 'Enter' && event.charCode === 13) {
            callback(...restParams);
        }
    }

    runIfEnterPrev = e => {
        this.runIfEnter(e, this.prev);
    }

    runIfEnterNext = e => {
        this.runIfEnter(e, this.next);
    }

    runIfEnterJumpPrev = e => {
        this.runIfEnter(e, this.jumpPrev);
    }

    runIfEnterJumpNext = e => {
        this.runIfEnter(e, this.jumpNext);
    }

    render() {
        // When hideOnsinglePage is true and there is only 1 page, hide the pager
        if (this.props.hideOnSinglePage === true && this.props.total <= this.state.pageSize) {
            return null;
        }

        const {
            prefixCls, showLessItems, itemRender, showPrevNextJumpers, showTotal, total,
            className, style
        } = this.props;
        const {
            current, pageSize
        } = this.state;
        const allPages = this.calculatePage();
        const pagerList = [];
        let jumpPrev = null;
        let jumpNext = null;
        let firstPager = null;
        let lastPager = null;

        const pageBufferSize = showLessItems ? 1 : 2;
        const prevPage = current - 1 > 0 ? current - 1 : 0;
        const nextPage = current + 1 < allPages ? current + 1 : allPages;

        if (allPages <= 5 + pageBufferSize * 2) {
            for (let i = 1; i <= allPages; i++) {
                const active = this.state.current === i;
                pagerList.push(
                    <Pager
                        rootPrefixCls={prefixCls}
                        onClick={this.handleChange}
                        onKeyPress={this.runIfEnter}
                        key={i}
                        page={i}
                        active={active}
                        itemRender={itemRender}
                    />
                );
            }
        } else {
            if (showPrevNextJumpers) {
                jumpPrev = (
                    <li
                        key="prev"
                        onClick={this.jumpPrev}
                        tabIndex="0"
                        onKeyPress={this.runIfEnterJumpPrev}
                        className={`${prefixCls}-jump-prev`}
                    >
                        {itemRender(
                            this.getJumpPrevPage(), 'jump-prev', <a className={`${prefixCls}-item-link`} />
                        )}
                    </li>
                );
                jumpNext = (
                    <li
                        key="next"
                        tabIndex="0"
                        onClick={this.jumpNext}
                        onKeyPress={this.runIfEnterJumpNext}
                        className={`${prefixCls}-jump-next`}
                    >
                        {itemRender(
                            this.getJumpNextPage(), 'jump-next', <a className={`${prefixCls}-item-link`} />
                        )}
                    </li>
                );
            }
            lastPager = (
                <Pager
                    last
                    rootPrefixCls={prefixCls}
                    onClick={this.handleChange}
                    onKeyPress={this.runIfEnter}
                    key={allPages}
                    page={allPages}
                    active={false}
                    itemRender={itemRender}
                />
            );
            firstPager = (
                <Pager
                    rootPrefixCls={prefixCls}
                    onClick={this.handleChange}
                    onKeyPress={this.runIfEnter}
                    key={1}
                    page={1}
                    active={false}
                    itemRender={itemRender}
                />
            );

            let left = Math.max(1, current - pageBufferSize);
            let right = Math.min(current + pageBufferSize, allPages);

            if (current - 1 <= pageBufferSize) {
                right = 1 + pageBufferSize * 2;
            }
            if (allPages - current <= pageBufferSize) {
                left = allPages - pageBufferSize * 2;
            }
            for (let i = left; i <= right; i++) {
                const active = current === i;
                pagerList.push(
                    <Pager
                        rootPrefixCls={prefixCls}
                        onClick={this.handleChange}
                        onKeyPress={this.runIfEnter}
                        key={i}
                        page={i}
                        active={active}
                        itemRender={itemRender}
                    />
                );
            }
            if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
                pagerList[0] = React.cloneElement(pagerList[0], {
                    className: `${prefixCls}-item-after-jump-prev`
                });
                pagerList.unshift(jumpPrev);
            }
            if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
                pagerList[pagerList.length - 1] = React.cloneElement(pagerList[pagerList.length - 1], {
                    className: `${prefixCls}-item-before-jump-next`
                });
                pagerList.push(jumpNext);
            }
            if (left !== 1) {
                pagerList.unshift(firstPager);
            }
            if (right !== allPages) {
                pagerList.push(lastPager);
            }
        }

        let totalText = null;

        if (showTotal) {
            totalText = (
                <li className={`${prefixCls}-total-text`}>
                    {showTotal(
                        total,
                        [
                            (current - 1) * pageSize + 1,
                            current * pageSize > total ? total : current * pageSize
                        ]
                    )}
                </li>
            );
        }
        const prevDisabled = !this.hasPrev();
        const nextDisabled = !this.hasNext();
        const classes = classNames(prefixCls, className);
        const classesOfPrev = classNames({[`${prefixCls}-disabled`]: prevDisabled}, `${prefixCls}-prev`);
        const classesOfNext = classNames({[`${prefixCls}-disabled`]: nextDisabled}, `${prefixCls}-next`);
        return (
            <ul
                className={classes}
                style={style}
                unselectable="unselectable"
                ref={this.savePaginationNode}
            >
                {totalText}
                <li
                    onClick={this.prev}
                    tabIndex={prevDisabled ? null : 0}
                    onKeyPress={this.runIfEnterPrev}
                    className={classesOfPrev}
                    aria-disabled={prevDisabled}
                >
                    {itemRender(prevPage, 'prev', <a className={`${prefixCls}-item-link`} />)}
                </li>
                {pagerList}
                <li
                    onClick={this.next}
                    tabIndex={nextDisabled ? null : 0}
                    onKeyPress={this.runIfEnterNext}
                    className={classesOfNext}
                    aria-disabled={nextDisabled}
                >
                    {itemRender(nextPage, 'next', <a className={`${prefixCls}-item-link`} />)}
                </li>
            </ul>
        );
    }
}

Pagination.propTypes = {
    hideOnSinglePage: PropTypes.bool,
    prefixCls: PropTypes.string,
    showLessItems: PropTypes.bool,
    showPrevNextJumpers: PropTypes.bool,
    showTotal: PropTypes.func,
    current: PropTypes.number,
    defaultCurrent: PropTypes.number,
    total: PropTypes.number,
    pageSize: PropTypes.number,
    defaultPageSize: PropTypes.number,
    onChange: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    itemRender: PropTypes.func
};
