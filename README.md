In the back end I added this code as I was unable to grab an item to edit.
// Get a single todo item
app.get('/todos/:id', authenticateUser, (req, res) => {
  const token = extractToken(req.headers.authorization);
  const user = findUserByToken(token);
  const todoId = parseInt(req.params.id);

  const todo = todos[user.username].find(todo => todo.id === todoId);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});
