<?php

namespace Oro\Bundle\CommentBundle\Migrations\Schema\v1_0;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\SchemaException;

use Oro\Bundle\CommentBundle\Migration\Extension\CommentExtension;
use Oro\Bundle\CommentBundle\Migration\Extension\CommentExtensionAwareInterface;
use Oro\Bundle\MigrationBundle\Migration\Migration;
use Oro\Bundle\MigrationBundle\Migration\QueryBag;

class OroCommentBundle implements Migration, CommentExtensionAwareInterface
{
    /** @var CommentExtension */
    protected $comment;

    /**
     * @param CommentExtension $commentExtension
     */
    public function setCommentExtension(CommentExtension $commentExtension)
    {
        $this->comment = $commentExtension;
    }

    /**
     * {@inheritdoc}
     */
    public function up(Schema $schema, QueryBag $queries)
    {
        self::createCommentTable($schema);
        self::addCommentToEmail($schema, $this->comment);
        self::addCommentToCalendarEvent($schema, $this->comment);
        self::addCommentToNote($schema, $this->comment);
    }

    /**
     * @param Schema $schema
     *
     * @throws SchemaException
     */
    public static function createCommentTable(Schema $schema)
    {
        $table = $schema->createTable('oro_comment');
        $table->addColumn('id', 'integer', ['autoincrement' => true]);
        $table->addColumn('user_owner_id', 'integer', ['notnull' => false]);
        $table->addColumn('updated_by_user_id', 'integer', ['notnull' => false]);
        $table->addColumn('message', 'text');
        $table->addColumn('organization_id', 'integer', ['notnull' => true]);
        $table->addColumn('createdAt', 'datetime', []);
        $table->addColumn('updatedAt', 'datetime', []);
        $table->addColumn('comments_type', 'string', ['length' => 255]);
        $table->addColumn('note_id', 'integer', ['notnull' => false]);

        $table->setPrimaryKey(['id']);
        $table->addIndex(['user_owner_id']);
        $table->addIndex(['updated_by_user_id'], 'IDX_30E6463D2793CC5E', []);
        $table->addIndex(['organization_id'], 'IDX_30E6463D32C8A3DE', []);
        $table->addIndex(['note_id']);

        $table->addForeignKeyConstraint(
            $schema->getTable('oro_user'),
            ['user_owner_id'],
            ['id'],
            ['onDelete' => 'SET NULL', 'onUpdate' => null]
        );
        $table->addForeignKeyConstraint(
            $schema->getTable('oro_user'),
            ['updated_by_user_id'],
            ['id'],
            ['onDelete' => 'SET NULL', 'onUpdate' => null]
        );
        $table->addForeignKeyConstraint(
            $schema->getTable('oro_organization'),
            ['organization_id'],
            ['id'],
            ['onDelete' => 'CASCADE', 'onUpdate' => null]
        );
        $table->addForeignKeyConstraint(
            $schema->getTable('oro_note'),
            ['note_id'],
            ['id'],
            ['onDelete' => 'SET NULL', 'onUpdate' => null]
        );
    }

    /**
     * @param Schema           $schema
     * @param CommentExtension $commentExtension
     */
    public static function addCommentToEmail(Schema $schema, CommentExtension $commentExtension)
    {
        $commentExtension->addCommentAssociation($schema, 'oro_email');
    }

    /**
     * @param Schema           $schema
     * @param CommentExtension $commentExtension
     */
    public static function addCommentToCalendarEvent(Schema $schema, CommentExtension $commentExtension)
    {
        $commentExtension->addCommentAssociation($schema, 'oro_calendar_event');
    }

    /**
     * @param Schema           $schema
     * @param CommentExtension $commentExtension
     */
    public static function addCommentToNote(Schema $schema, CommentExtension $commentExtension)
    {
        #$commentExtension->addCommentAssociation($schema, 'oro_note');
    }
}
