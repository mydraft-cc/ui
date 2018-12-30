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

class UIMenu extends React.PureComponent<UIMenuProps> {
    private doZoomOut = () => {
        this.props.setZoom(this.props.zoom - .25);
    }

    private doZoomIn = () => {
        this.props.setZoom(this.props.zoom + .25);
    }

    public render() {
        return (
            <>
                <Tooltip mouseEnterDelay={1} title='Zoom Out (ALT + [-])'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canZoomOut}
                        onClick={this.doZoomOut}>
                        <Icon type='minus-circle-o' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!this.props.canZoomOut} onPressed={this.doZoomOut} keys='alt+-' />

                <span className='menu-item'>{this.props.zoom * 100}</span>

                <Tooltip mouseEnterDelay={1} title='Zoom In (ALT + [+])'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canZoomIn}
                        onClick={this.doZoomIn}>
                        <Icon type='plus-circle-o' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!this.props.canZoomIn} onPressed={this.doZoomIn} keys='alt+plus' />
            </>
        );
    }
}

export const UIMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIMenu);