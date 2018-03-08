import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux';
import * as React from 'react';

import { Layout, Tabs } from 'antd';

import {
    ArrangeMenuContainer,
    HistoryMenuContainer
} from '@app/wireframes/components';

import {
    RendererService,
    selectTab,
    UIState
} from '@app/wireframes/model';

import { EditorContainer } from '@app/wireframes/renderer/editor';

interface AppOwnProps {
    // The renderer service.
    rendererService: RendererService;
}

interface AppProps {
    // Show left sidebar.
    showLeftSidebar: boolean;

    // Show right sidebar.
    showRightSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    // Select a tab.
    selectTab: (key: string) => any;
}

const mapStateToProps = (props: AppOwnProps, state: { ui: UIState }) => {
    return {
        rendererService: props.rendererService,
        selectedtab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar,
        showRightSidebar: state.ui.showRightSidebar
    };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    selectTab
}, dispatch);

class App extends React.Component<AppProps & AppOwnProps, {}> {
    public render() {
        return (
            <Layout>
                <Layout.Header>
                    <HistoryMenuContainer />
                    <ArrangeMenuContainer />
                </Layout.Header>
                <Layout>
                    <Layout.Sider width={200}
                        collapsed={!this.props.showLeftSidebar}
                        collapsedWidth={0}
                        collapsible={true}>
                        <Tabs type='card' onTabClick={(key: string) => this.props.selectTab(key)} activeKey={this.props.selectedTab}>
                            <Tabs.TabPane key='Shapes' tab='Shapes'>
                            </Tabs.TabPane>
                            <Tabs.TabPane key='Icons' tab='Icons'>
                            </Tabs.TabPane>
                        </Tabs>
                    </Layout.Sider>
                    <Layout.Content>
                        <EditorContainer rendererService={this.props.rendererService} />
                    </Layout.Content>
                    <Layout.Sider width={200}
                        collapsed={!this.props.showRightSidebar}
                        collapsedWidth={0}
                        collapsible={true}>
                    </Layout.Sider>
                </Layout>
            </Layout>
        );
    }
}


export const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);