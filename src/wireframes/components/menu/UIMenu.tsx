import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import { setZoom, UIStateInStore } from '@app/wireframes/model';

interface UIMenuProps {
    // Indicates if you can zoom in.
    canZoomIn: boolean;

    // Indicates if you can zoom out.
    canZoomOut: boolean;

    // The zoom level.
    zoom: number;

    // Sets the zoom.
    setZoom: (value: number) => any;
}

class UIMenu extends React.PureComponent<UIMenuProps> {
    private doZoomOut = () => {
        this.props.setZoom(this.props.zoom - .25);
    }

    private doZoomIn = () => {
        this.props.setZoom(this.props.zoom + .25);
    }

    public render() {
        const { canZoomIn, canZoomOut, zoom } = this.props;

        return (
            <>
                <Tooltip mouseEnterDelay={1} title='Zoom Out (ALT + [-])'>
                    <Button className='menu-item' size='large'
                        disabled={!canZoomOut}
                        onClick={this.doZoomOut}>
                        <Icon type='minus-circle-o' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!canZoomOut} onPressed={this.doZoomOut} keys='alt+-' />

                <span className='menu-item'>{zoom * 100}</span>

                <Tooltip mouseEnterDelay={1} title='Zoom In (ALT + [+])'>
                    <Button className='menu-item' size='large'
                        disabled={!canZoomIn}
                        onClick={this.doZoomIn}>
                        <Icon type='plus-circle-o' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!canZoomIn} onPressed={this.doZoomIn} keys='alt+plus' />
            </>
        );
    }
}

const mapStateToProps = (state: UIStateInStore) => {
    return {
        canZoomIn: state.ui.zoom < 2,
        canZoomOut: state.ui.zoom > .25,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    setZoom
}, dispatch);

export const UIMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIMenu);