import express from "express";
import bcrypt from "bcrypt";
import authenticateJWT from "./middleware/authenticate.js";
const router = express.Router();

// Usuário: Criar
router.post("/user", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username e password são obrigatórios" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: users.length + 1, username, password: hashedPassword });
  res.status(201).json({ message: "Usuário criado com sucesso" });
});

// Usuário: Login
router.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Usuário: Atualizar
router.put("/user", authenticateJWT, async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  if (username) user.username = username;
  if (password) user.password = await bcrypt.hash(password, 10);

  res.json({ message: "Usuário atualizado com sucesso" });
});

// Usuário: Deletar
router.delete("/user", authenticateJWT, (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  users.splice(userIndex, 1);
  res.json({ message: "Usuário deletado com sucesso" });
});

// Nota: Obter todas
router.get("/notes", authenticateJWT, (req, res) => {
  const userNotes = notes.filter((note) => note.userId === req.user.id);
  res.json(userNotes);
});

// Nota: Criar
router.post("/notes", authenticateJWT, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res
      .status(400)
      .json({ error: "Título e conteúdo são obrigatórios" });
  }

  const newNote = { id: notes.length + 1, userId: req.user.id, title, content };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// Nota: Atualizar
router.put("/notes/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const note = notes.find(
    (n) => n.id === parseInt(id) && n.userId === req.user.id
  );
  if (!note) {
    return res.status(404).json({ error: "Nota não encontrada" });
  }

  if (title) note.title = title;
  if (content) note.content = content;

  res.json({ message: "Nota atualizada com sucesso" });
});

// Nota: Deletar
router.delete("/notes/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;

  const noteIndex = notes.findIndex(
    (n) => n.id === parseInt(id) && n.userId === req.user.id
  );
  if (noteIndex === -1) {
    return res.status(404).json({ error: "Nota não encontrada" });
  }

  notes.splice(noteIndex, 1);
  res.json({ message: "Nota deletada com sucesso" });
});

export default router;
