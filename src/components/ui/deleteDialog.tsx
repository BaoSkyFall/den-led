"use client";
import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./button";

type DeleteDialogProps = {
  onClickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
  triggerLabel?: string;
  title?: string;
  description?: string;
  cancelLabel?: string;
  actionLabel?: string;
  /**
   * Replaces the default destructive button, for places where a full-width
   * labelled button does not fit (e.g. compact icon rows). Must render a single
   * element — it is passed to `AlertDialogTrigger asChild`.
   */
  trigger?: React.ReactNode;
};

function DeleteDialog({
  onClickHandler,
  title,
  description,
  triggerLabel,
  actionLabel,
  cancelLabel,
  trigger,
}: DeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive">{triggerLabel || "Delete"}</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ||
              "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel || "Cancel"}</AlertDialogCancel>
          <AlertDialogAction onClick={onClickHandler}>
            {actionLabel || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialog;
