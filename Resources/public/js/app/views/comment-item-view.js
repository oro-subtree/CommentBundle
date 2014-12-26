/*global define*/
define(function (require) {
    'use strict';

    var CommentItemView,
        __ = require('orotranslation/js/translator'),
        moment = require('moment'),
        routing = require('routing'),
        mediator = require('oroui/js/mediator'),
        BaseView = require('oroui/js/app/views/base/view'),
        template = require('text!../../../templates/comment/comment-item-view.html');


    function timeDiff(time) {
        var diff, unit, scale = {},
            minute = scale.minute = 1000 * 60,
            hour = scale.hour = minute * 60,
            day = scale.day = hour * 24,
            month = scale.month = day * 30,
            year = scale.year = day * 365;

        time = moment(time).valueOf();
        diff = moment().valueOf() - time;

        if (diff > year) {
            unit = 'year';
        } else if (diff > month) {
            unit = 'month';
        } else if (diff > day) {
            unit = 'day';
        } else if (diff > hour) {
            unit = 'hour';
        } else {
            unit = 'minute';
        }

        diff = {
            number: Math.floor(diff / scale[unit]),
            unit: unit
        };

        return diff;
    }

    CommentItemView = BaseView.extend({
        template: template,
        tagName: 'li',
        className: 'comment-item',

        events: {
            'click .item-remove-button': 'removeModel',
            'click .item-edit-button': 'editModel',
            'click .item-remove-attachment': 'removeAttachment',
            'shown .accordion-body': 'onToggle',
            'hidden .accordion-body': 'onToggle'
        },

        listen: {
            'change:updatedAt model': 'render'
        },

        accordionId: null,
        collapsed: true,

        initialize: function (options) {
            _.extend(this, _.pick(options || {}, ['accordionId', 'collapsed']));
            CommentItemView.__super__.initialize.apply(this, arguments);
        },

        getTemplateData: function () {
            var diff,
                data = CommentItemView.__super__.getTemplateData.call(this);
            data.cid = this.cid;
            data.accordionId = this.accordionId;
            data.accordionTargetId = this.getAccordionTargetId();
            data.hasActions = data.removable || data.editable;
            data.message = this.prepareMessage();
            data.shortMessage = this.prepareShortMessage();
            data.isCollapsible = data.message !== data.shortMessage || data.attachmentURL;
            data.collapsed = this.collapsed;
            if (data.createdAt) {
                diff = timeDiff(data.createdAt);
                data.createdTime = __('oro.comment.item.' + diff.unit + 's_ago', {number: diff.number}, diff.number);
            }
            if (data.updatedAt) {
                diff = timeDiff(data.updatedAt);
                data.updatedTime = __('oro.comment.item.' + diff.unit + 's_ago', {number: diff.number}, diff.number);
            }
            if (data.owner_id) {
                data.owner_url = routing.generate('oro_user_view', {id: data.owner_id});
            }
            if (data.editor_id) {
                data.editor_url = routing.generate('oro_user_view', {id: data.editor_id});
            }
            return data;
        },

        render: function () {
            CommentItemView.__super__.render.apply(this, arguments);
            this.$('.dropdown-toggle').on('mouseover', function () {
                $(this).trigger('click');
            });
            this.$('.dropdown-menu').on('mouseleave', function () {
                $(this).parent().find('a.dropdown-toggle').trigger('click');
            });
            return this;
        },

        removeModel: function (e) {
            e.stopPropagation();
            this.model.destroy();
        },

        removeAttachment: function(e) {
            var itemView = this;
            e.stopPropagation();
            this.model.removeAttachment().then(function () {
                itemView.$('.attachment-item').remove();
                mediator.execute('showFlashMessage', 'success', __('oro.comment.attachment.delete_message'));
            });
        },

        editModel: function (e) {
            e.stopPropagation();
            if (!this.$('form').length) {
                // if it's not edit mode yet
                this.model.trigger('toEdit', this.model);
            }
            this.$('#' + this.getAccordionTargetId()).collapse({
                toggle: false
            }).collapse('show');
            this.$('form :input:first').click().focus();
        },

        onToggle: function (e) {
            this.collapsed = e.type === 'hidden';
        },

        getAccordionTargetId: function () {
            return 'accordion-item-' + this.cid;
        },

        prepareShortMessage: function () {
            var shortMessage = this.prepareMessage(),
                lineBreak = shortMessage.indexOf('<br />');
            if (lineBreak > 0) {
                shortMessage = shortMessage.substr(0, shortMessage.indexOf('<br />'));
            }
            shortMessage = _.trunc(shortMessage, 70, true);
            return shortMessage;
        },

        prepareMessage: function () {
            var message = this.model.get('message');
            message = _.nl2br(_.escape(message));
            return message;
        }
    });

    return CommentItemView;
});
