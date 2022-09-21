/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Empty } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { loadDiagram, RecentDiagram, useStore } from '@app/wireframes/model';
import { RecentItem } from './RecentItem';
import './Recent.scss';

export const Recent = () => {
    const dispatch = useDispatch();
    const recent = useStore(x => x.loading.recentDiagrams);

    const doLoad = useEventCallback((item: RecentDiagram) => {
        dispatch(loadDiagram({ tokenToRead: item.tokenToRead, tokenToWrite: item.tokenToWrite, navigate: true }));
    });

    const orderedRecent = React.useMemo(() => {
        const result = Object.entries(recent).map(([tokenToRead, value]) => {
            return { ...value, tokenToRead };
        });

        result.sort((lhs, rhs) => rhs.date - lhs.date);

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
