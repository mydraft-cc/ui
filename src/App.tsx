/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Layout, Tabs, TabsProps } from 'antd';
import classNames from 'classnames';
import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { ClipboardContainer, useEventCallback, usePrinter } from '@app/core';
import { ArrangeMenu, ClipboardMenu, EditorView, HistoryMenu, Icons, LoadingMenu, LockMenu, Outline, Pages, PrintView, Properties, Recent, SettingsMenu, Shapes, UIMenu } from '@app/wireframes/components';
import { loadDiagramFromServer, newDiagram, selectTab, showToast, toggleLeftSidebar, toggleRightSidebar, useStore } from '@app/wireframes/model';
import { useAppDispatch } from './store';
import { texts } from './texts';
import { CustomDragLayer } from './wireframes/components/CustomDragLayer';
import { PresentationView } from './wireframes/components/PresentationView';
import { OverlayContainer } from './wireframes/contexts/OverlayContext';

const SidebarTabs: TabsProps['items'] = [
    {
        key: 'shapes',
        label: texts.common.shapes,
        children: <Shapes />,
    },
    {
        key: 'icons',
        label: texts.common.icons,
        children: <Icons />,
    },
    {
        key: 'outline',
        label: texts.common.outline,
        children: <Outline />,
    },
    {
        key: 'pages',
        label: texts.common.pages,
        children: <Pages />,
    },
    {
        key: 'recent',
        label: texts.common.recent,
        children: <Recent />,
    },
];

export const App = () => {
    const dispatch = useAppDispatch();
    const route = useRouteMatch<{ token?: string }>();
    const routeToken = route.params.token || null;
    const routeTokenSnapshot = React.useRef(routeToken);
    const selectedTab = useStore(s => s.ui.selectedTab);
    const showLeftSidebar = useStore(s => s.ui.showLeftSidebar);
    const showRightSidebar = useStore(s => s.ui.showRightSidebar);
    const [presenting, setPresenting] = React.useState(false);

    const [
        print,
        printReady,
        isPrinting,
        ref,
    ] = usePrinter();

    React.useEffect(() => {
        const token = routeTokenSnapshot.current;

        if (token && token.length > 0) {
            dispatch(loadDiagramFromServer({ tokenToRead: token, navigate: false }));
        } else {
            dispatch(newDiagram(false));
        }
    }, [dispatch]);

    React.useEffect(() => {
        if (isPrinting) {
            dispatch(showToast(texts.common.printingStarted));
        }
    }, [dispatch, isPrinting]);

    const doSelectTab = useEventCallback((key: string) => {
        dispatch(selectTab(key));
    });

    const doToggleLeftSidebar = useEventCallback(() => {
        dispatch(toggleLeftSidebar());
    });

    const doToggleRightSidebar = useEventCallback(() => {
        dispatch(toggleRightSidebar());
    });

    const doEdit = useEventCallback(() => {
        setPresenting(false);
    });

    const doPresent = useEventCallback(() => {
        setPresenting(true);
    });

    return (
        <OverlayContainer>
            <ClipboardContainer>
                <Layout className='screen-mode'>
                    <Layout.Header>
                        <div className='top-menu'>
                            <img className='logo' src='logo.svg' alt='mydraft.cc' />

                            <div>
                                <HistoryMenu />
                                <span className='menu-separator' />

                                <LockMenu />
                                <span className='menu-separator' />

                                <ArrangeMenu />
                                <span className='menu-separator' />

                                <ClipboardMenu />
                                <span className='menu-separator' />

                                <UIMenu onPlay={doPresent} />
                                <span className='menu-separator' />

                                <SettingsMenu onPrint={print} />
                            </div>

                            <div>
                                <LoadingMenu />
                            </div>
                        </div>
                    </Layout.Header>
                    <Layout className='content'>
                        <Layout.Sider width={320} className='sidebar-left'
                            collapsed={!showLeftSidebar}
                            collapsedWidth={0}>

                            <Tabs type='card' activeKey={selectedTab} items={SidebarTabs} onChange={doSelectTab} destroyInactiveTabPane={true} />
                        </Layout.Sider>
                        <Layout.Content className='editor-content'>
                            <EditorView spacing={40} />
                        </Layout.Content>
                        <Layout.Sider width={330} className='sidebar-right'
                            collapsed={!showRightSidebar}
                            collapsedWidth={0}>

                            <Properties />
                        </Layout.Sider>

                        <Button icon={showLeftSidebar ? <LeftOutlined /> : <RightOutlined />}
                            className={classNames('toggle-button-left', { visible: showLeftSidebar })}
                            size='small'
                            shape='circle'
                            onClick={doToggleLeftSidebar} />

                        <Button icon={showRightSidebar ? <RightOutlined /> : <LeftOutlined />}
                            className={classNames('toggle-button-right', { visible: showRightSidebar })}
                            size='small'
                            shape='circle'
                            onClick={doToggleRightSidebar} />
                    </Layout>
                </Layout>

                {presenting &&
                    <PresentationView onClose={doEdit} />
                }

                {isPrinting &&
                    <div className='print-mode' ref={ref}>
                        <PrintView onRender={printReady} />
                    </div>
                }

                <CustomDragLayer />
            </ClipboardContainer>
        </OverlayContainer>
    );
};
