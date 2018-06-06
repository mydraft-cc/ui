import { Button, Collapse, Layout, Tabs } from 'antd';
import * as React from 'react';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    ArrangeMenuContainer,
    ClipboardMenuContainer,
    CustomPropertiesContainer,
    EditorViewContainer,
    HistoryMenuContainer,
    IconsContainer,
    LayoutPropertiesContainer,
    LoadingMenuContainer,
    ShapesContainer,
    UIMenuContainer,
    VisualPropertiesContainer
} from '@app/wireframes/components';

import {
    loadDiagramAsync,
    RendererService,
    selectTab,
    toggleLeftSidebar,
    toggleRightSidebar,
    UIStateInStore
} from '@app/wireframes/model';

interface AppOwnProps {
    // The read token of the diagram.
    token: string;

    // The renderer service.
    rendererService: RendererService;
}

interface AppProps {
    // The renderer service.
    rendererService: RendererService;

    // Show left sidebar.
    showLeftSidebar: boolean;

    // Show right sidebar.
    showRightSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    // Select a tab.
    selectTab: (key: string) => any;

    // Show or hide the left sidebar.
    toggleLeftSidebar: () =>  any;

    // Show or hide the right sidebar.
    toggleRightSidebar: () =>  any;

    // Load a diagram.
    loadDiagramAsync: (token: string) => any;
}

const mapStateToProps = (state: UIStateInStore, props: AppOwnProps) => {
    return {
        rendererService: props.rendererService,
        selectedTab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar,
        showRightSidebar: state.ui.showRightSidebar
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    loadDiagramAsync, selectTab, toggleLeftSidebar, toggleRightSidebar
}, dispatch);

class App extends React.PureComponent<AppProps & AppOwnProps> {
    public componentDidMount() {
        this.props.loadDiagramAsync(this.props.token);
    }

    private doSelectTab = (key: string) => {
        this.props.selectTab(key);
    }

    private doToggleLeftSidebar = () => {
        this.props.toggleLeftSidebar();
    }

    private doToggleRightSidebar = () => {
        this.props.toggleLeftSidebar();
    }

    public render() {
        return (
            <DragDropContextProvider backend={HTML5Backend}>
                <Layout>
                    <Layout.Header>
                        <span className='logo'>mydraft.cc</span>

                        <HistoryMenuContainer />
                        <span className='menu-separator' />

                        <ArrangeMenuContainer />
                        <span className='menu-separator' />

                        <ClipboardMenuContainer />
                        <span className='menu-separator' />

                        <UIMenuContainer />

                        <span style={{ float: 'right' }}>
                            <LoadingMenuContainer />
                        </span>
                    </Layout.Header>
                    <Layout className='content'>
                        <Layout.Sider width={320} className='sidebar-left'
                            collapsed={!this.props.showLeftSidebar}
                            collapsedWidth={0}>

                            <Tabs type='card' onTabClick={this.doSelectTab} activeKey={this.props.selectedTab}>
                                <Tabs.TabPane key='shapes' tab='Shapes'>
                                    <ShapesContainer />
                                </Tabs.TabPane>
                                <Tabs.TabPane key='icons' tab='Icons'>
                                    <IconsContainer />
                                </Tabs.TabPane>
                            </Tabs>
                        </Layout.Sider>
                        <Layout.Content className='editor-content'>
                            <EditorViewContainer rendererService={this.props.rendererService} spacing={40} />
                        </Layout.Content>
                        <Layout.Sider width={330} className='sidebar-right'
                            collapsed={!this.props.showRightSidebar}
                            collapsedWidth={0}>

                            <Collapse bordered={false} defaultActiveKey={['layout', 'visual', 'custom']}>
                                <Collapse.Panel key='layout' header='Layout'>
                                    <LayoutPropertiesContainer />
                                </Collapse.Panel>
                                <Collapse.Panel key='visual' header='Visual'>
                                    <VisualPropertiesContainer />
                                </Collapse.Panel>
                                <Collapse.Panel key='custom' header='Custom'>
                                    <CustomPropertiesContainer />
                                </Collapse.Panel>
                            </Collapse>
                        </Layout.Sider>

                        <Button icon={toggleIcon(this.props.showLeftSidebar)}
                            className={toggleClass(this.props.showLeftSidebar, 'left')}
                            size='small'
                            shape='circle'
                            onClick={this.doToggleLeftSidebar} />

                        <Button icon={toggleIcon(!this.props.showRightSidebar)}
                            className={toggleClass(this.props.showRightSidebar, 'right')}
                            size='small'
                            shape='circle'
                            onClick={this.doToggleRightSidebar} />
                    </Layout>
                </Layout>
            </DragDropContextProvider>
        );
    }
}

const toggleIcon = (left: boolean) => {
    return left ? 'left' : 'right';
};

const toggleClass = (visible: boolean, side: string) => {
    return `toggle-button-${side}` + (visible ? ' visible' : '');
};

export const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);