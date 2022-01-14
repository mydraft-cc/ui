/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Empty } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { texts } from '@app/texts';
import { loadDiagramAsync, RecentDiagram, useStore } from '@app/wireframes/model';
import './Recent.scss';
import { RecentItem } from './RecentItem';

export const Recent = () => {
    const dispatch = useDispatch();
    const recent = useStore(x => x.loading.recentDiagrams);

    const doLoad = React.useCallback((item: RecentDiagram) => {
        dispatch(loadDiagramAsync({ tokenToRead: item.tokenToRead, tokenToWrite: item.tokenToWrite, navigate: true }));
    }, [dispatch]);

    const orderedRecent = React.useMemo(() => {
        const result = Object.entries(recent).map(([tokenToRead, value]) => {
            return { ...value, tokenToRead };
        });

        result.sort((lhs, rhs) => lhs.date - rhs.date);

        return result;
    }, [recent]);

    return (
        <>
            <div className='recent-list'>
                {orderedRecent.map((item) =>
                    <RecentItem item={item} onLoad={doLoad} />,
                )}

                {orderedRecent.length === 0 &&
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={texts.common.noRecentDocument} />
                }
            </div>
        </>
    );
};
