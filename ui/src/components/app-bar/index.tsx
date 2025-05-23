// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppBar as KouprAppBar } from '@koupr/ui'
import AccountMenu from '@/components/account/account-menu'
import ConsoleButton from '@/components/console/console-button'
import TaskDrawer from '@/components/task/task-drawer'
import { getAdminStatus } from '@/infra/token'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { activeNavChanged, NavType } from '@/store/ui/nav'
import { Extensions } from '@/types/extensibility'
import UploadDrawer from '../upload/upload-drawer'
import {
  CreateGroupButton,
  CreateOrganizationButton,
  CreateWorkspaceButton,
} from './app-bar-buttons'
import AppBarSearch from './app-bar-search'

export type AppBarProps = {
  extensions?: Extensions
}

const AppBar = ({ extensions }: AppBarProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const activeNav = useAppSelector((state) => state.ui.nav.active)

  useEffect(() => {
    if (location.pathname.startsWith('/account')) {
      dispatch(activeNavChanged(NavType.Account))
    }
    if (location.pathname.startsWith('/organization')) {
      dispatch(activeNavChanged(NavType.Organizations))
    }
    if (location.pathname.startsWith('/group')) {
      dispatch(activeNavChanged(NavType.Groups))
    }
    if (location.pathname.startsWith('/workspace')) {
      dispatch(activeNavChanged(NavType.Workspaces))
    }
    if (location.pathname.startsWith('/console')) {
      dispatch(activeNavChanged(NavType.Console))
    }
  }, [location, dispatch])

  return (
    <KouprAppBar
      bar={<AppBarSearch />}
      buttons={
        <>
          {activeNav === NavType.Workspaces ? <CreateWorkspaceButton /> : null}
          {activeNav === NavType.Groups ? <CreateGroupButton /> : null}
          {activeNav === NavType.Organizations ? (
            <CreateOrganizationButton />
          ) : null}
          {getAdminStatus() ? <ConsoleButton /> : null}
          <UploadDrawer />
          <TaskDrawer />
          <AccountMenu extensions={extensions?.account} />
        </>
      }
    />
  )
}

export default AppBar
