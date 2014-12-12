<?php

namespace Oro\Bundle\CommentBundle\Migration\Extension;

/**
 * CommentExtensionAwareInterface should be implemented by migrations that depends on a CommentExtension.
 */
interface CommentExtensionAwareInterface
{
    /**
     * Sets the NoteExtension
     *
     * @param CommentExtension $commentExtension
     */
    public function setCommentExtension(CommentExtension $commentExtension);
}
