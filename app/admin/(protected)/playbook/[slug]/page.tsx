import { notFound } from "next/navigation";

import { getAdminPost } from "@/lib/admin/posts";
import PostForm from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

const EditPostPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getAdminPost(params.slug);
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">{post.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">/playbook/{post.slug}</p>
      <div className="mt-6">
        <PostForm initial={post} isNew={false} />
      </div>
    </div>
  );
};

export default EditPostPage;
