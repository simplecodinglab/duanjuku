"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      toast.error(resData.error);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <ToastContainer position="top-center" />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">管理员登录</h1>
        <p className="text-balance text-sm text-muted-foreground">
          短剧库后台管理
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">用户名</Label>
          <Input
            id="username"
            type="text"
            placeholder="用户名"
            {...register("username", { required: true, pattern: /^\S+@\S+$/i })}
          />
          {errors.username && (
            <p className="text-sm text-red-500">请输入有效的用户名</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-sm text-red-500">请输入密码</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          登录
        </Button>
      </div>
    </form>
  );
}
