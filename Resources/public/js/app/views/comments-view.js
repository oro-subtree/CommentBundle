/*global define*/
define(function (require) {
    'use strict';

    var CommentsView,
        BaseView = require('oroui/js/app/views/base/view'),
        CommentsHeaderView = require('./comments-header-view'),
        CommentItemView = require('./comment-item-view'),
        BaseCollectionView = require('oroui/js/app/views/base/collection-view'),
        template = require('text!../../../templates/comment/comments-view.html');

    CommentsView = BaseView.extend({
        template: template,
        events: {
            'click .add-comment-button': 'onAddCommentClick',
            'comment-edit': 'onEditComment',
            'comment-remove': 'onRemoveComment',
            'click a.load-more': 'onLoadMoreClick'
        },

        getTemplateData: function () {
            var data = CommentsView.__super__.getTemplateData.apply(this, arguments);
            data.canCreate = this.canCreate;
            return data;
        },

        initialize: function (options) {
            this.canCreate = options.canCreate;
            CommentsHeaderView.__super__.initialize.apply(this, arguments);
        },

        render: function () {
            CommentsView.__super__.render.apply(this, arguments);
            this.subview('header', new CommentsHeaderView({
                el: this.$('.comments-view-header'),
                collection: this.collection,
                canCreate: this.canCreate,
                autoRender: true
            }));
            this.subview('list', new BaseCollectionView({
                el: this.$('.comments-view-body'),
                animationDuration: 0,
                collection: this.collection,
                itemView: CommentItemView,
                autoRender: true
            }));
        },

        onLoadMoreClick: function () {
            this.collection.loadMore();
        },

        onAddCommentClick: function () {
            this.trigger('toAdd');
        },

        onEditComment: function (e, model) {
            this.trigger('toEdit', model);
        },

        onRemoveComment: function (e, model) {
            this.trigger('toRemove', model);
        }
    });

    return CommentsView;
});
