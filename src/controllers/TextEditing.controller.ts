// import { TextEditorDto } from "../dto/textEditor.dto";
// import { Request, Response } from "express";
// import { TextEditor } from "../entity/user.entity";

// export const createDocument = async (req: Request, res: Response) => {
//   try {
//     const { title, file, collaborators, owner }: TextEditorDto = req.body;

//     if (!title || !file || !owner) return;

//     const createdDocument = await TextEditor.create({
//       collaborators,
//       file,
//       owner,
//       title,
//     });

//     return createdDocument;
//   } catch (err) {
//     console.log(err);
//     return { message: "Xabarlarni olishda xatolik", error: err };
//   }
// };
