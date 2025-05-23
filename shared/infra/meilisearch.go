// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.

package infra

import (
	"github.com/meilisearch/meilisearch-go"

	"github.com/kouprlabs/voltaserve/shared/config"
)

type meilisearchManager struct {
	searchConfig config.SearchConfig
}

var meilisearchClient meilisearch.ServiceManager

func newMeilisearchManager(searchConfig config.SearchConfig) *meilisearchManager {
	if meilisearchClient == nil {
		if searchConfig.APIKey == "" {
			meilisearchClient = meilisearch.New(searchConfig.URL)
		} else {
			meilisearchClient = meilisearch.New(searchConfig.URL, meilisearch.WithAPIKey(searchConfig.APIKey))
		}
	}
	mgr := &meilisearchManager{
		searchConfig: searchConfig,
	}
	if err := mgr.createFileIndex(); err != nil {
		panic(err)
	}
	if err := mgr.createGroupIndex(); err != nil {
		panic(err)
	}
	if err := mgr.createWorkspaceIndex(); err != nil {
		panic(err)
	}
	if err := mgr.createOrganizationIndex(); err != nil {
		panic(err)
	}
	if err := mgr.createUserIndex(); err != nil {
		panic(err)
	}
	if err := mgr.createTaskIndex(); err != nil {
		panic(err)
	}
	return mgr
}

func (mgr *meilisearchManager) Query(index string, query string, opts SearchQueryOptions) ([]interface{}, error) {
	res, err := meilisearchClient.Index(index).Search(query, &meilisearch.SearchRequest{
		Limit:  opts.Limit,
		Filter: opts.Filter,
	})
	if err != nil {
		return nil, err
	}
	return res.Hits, nil
}

func (mgr *meilisearchManager) Index(index string, models []SearchModel) error {
	_, err := meilisearchClient.Index(index).AddDocuments(models)
	if err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) Update(index string, m []SearchModel) error {
	_, err := meilisearchClient.Index(index).UpdateDocuments(m)
	if err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) Delete(index string, ids []string) error {
	_, err := meilisearchClient.Index(index).DeleteDocuments(ids)
	if err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) createFileIndex() error {
	if _, err := meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        FileSearchIndex,
		PrimaryKey: "id",
	}); err != nil {
		return err
	}
	if _, err := meilisearchClient.Index(FileSearchIndex).UpdateSettings(&meilisearch.Settings{
		SearchableAttributes: []string{"name", "text", "summary"},
		FilterableAttributes: []string{
			"id",
			"workspaceId",
			"type",
			"parentId",
			"snapshotId",
			"createTime",
			"updateTime",
		},
	}); err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) createGroupIndex() error {
	if _, err := meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        GroupSearchIndex,
		PrimaryKey: "id",
	}); err != nil {
		return err
	}
	if _, err := meilisearchClient.Index(GroupSearchIndex).UpdateSettings(&meilisearch.Settings{
		SearchableAttributes: []string{"name"},
		FilterableAttributes: []string{
			"id",
			"organizationId",
			"members",
			"createTime",
			"updateTime",
		},
	}); err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) createWorkspaceIndex() error {
	if _, err := meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        WorkspaceSearchIndex,
		PrimaryKey: "id",
	}); err != nil {
		return err
	}
	if _, err := meilisearchClient.Index(WorkspaceSearchIndex).UpdateSettings(&meilisearch.Settings{
		SearchableAttributes: []string{"name"},
		FilterableAttributes: []string{
			"id",
			"storageCapacity",
			"rootId",
			"organizationId",
			"bucket",
			"createTime",
			"updateTime",
		},
	}); err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) createOrganizationIndex() error {
	if _, err := meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        OrganizationSearchIndex,
		PrimaryKey: "id",
	}); err != nil {
		return err
	}
	if _, err := meilisearchClient.Index(OrganizationSearchIndex).UpdateSettings(&meilisearch.Settings{
		SearchableAttributes: []string{"name"},
		FilterableAttributes: []string{
			"id",
			"members",
			"createTime",
			"updateTime",
		},
	}); err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) createUserIndex() error {
	if _, err := meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        UserSearchIndex,
		PrimaryKey: "id",
	}); err != nil {
		return err
	}
	if _, err := meilisearchClient.Index(UserSearchIndex).UpdateSettings(&meilisearch.Settings{
		SearchableAttributes: []string{"fullName", "username", "email"},
		FilterableAttributes: []string{
			"id",
			"isEmailConfirmed",
			"createTime",
			"updateTime",
		},
	}); err != nil {
		return err
	}
	return nil
}

func (mgr *meilisearchManager) createTaskIndex() error {
	if _, err := meilisearchClient.CreateIndex(&meilisearch.IndexConfig{
		Uid:        TaskSearchIndex,
		PrimaryKey: "id",
	}); err != nil {
		return err
	}
	if _, err := meilisearchClient.Index(TaskSearchIndex).UpdateSettings(&meilisearch.Settings{
		SearchableAttributes: []string{"name"},
		FilterableAttributes: []string{
			"id",
			"error",
			"percentage",
			"isIndeterminate",
			"userId",
			"status",
			"createTime",
			"updateTime",
		},
	}); err != nil {
		return err
	}
	return nil
}
