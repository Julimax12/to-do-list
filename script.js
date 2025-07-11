// TO-DO LIST APPLICATION - JAVASCRIPT WITH DOM MANIPULATION
// Global variables to store application state
let tasks = [] // Array to store all tasks
let taskIdCounter = 0 // Counter to generate unique IDs for tasks

// DATA LOADING FUNCTIONALITY
// Function to load tasks from data.json file
// Demonstrates fetch API and JSON data manipulation

async function loadTasksFromJSON() {
  try {
    // Fetch data from the JSON file (DOM/Network API)
    const response = await fetch("data.json")

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Parse the JSON data
    const data = await response.json()

    // Load tasks from JSON data into our application state
    if (data.tasks && Array.isArray(data.tasks)) {
      tasks = data.tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt), // Convert string dates back to Date objects
      }))

      // Update the task ID counter to prevent ID conflicts
      taskIdCounter = Math.max(...tasks.map((task) => task.id), 0)

      // Re-render tasks and update statistics
      renderTasks()
      updateStatistics()

      console.log(`Loaded ${tasks.length} tasks from data.json`)
    }

    // Store additional data for potential future use
    if (data.categories) {
      window.taskCategories = data.categories
    }

    if (data.priorities) {
      window.taskPriorities = data.priorities
    }

    if (data.settings) {
      window.appSettings = data.settings
    }
  } catch (error) {
    console.error("Error loading tasks from JSON:", error)
    console.log("Starting with empty task list")

    // Initialize with empty state if loading fails
    tasks = []
    taskIdCounter = 0
    renderTasks()
    updateStatistics()
  }
}

// DOM ELEMENT REFERENCES
// Getting references to DOM elements that we'll manipulate throughout the app
// This is more efficient than querying the DOM every time we need these elements

const taskInput = document.getElementById("taskInput") // Input field for new tasks
const addTaskBtn = document.getElementById("addTaskBtn") // Button to add new tasks
const taskList = document.getElementById("taskList") // Container for all task items
const emptyState = document.getElementById("emptyState") // Message shown when no tasks exist
const clearCompletedBtn = document.getElementById("clearCompletedBtn") // Button to clear completed tasks

// Statistics elements for displaying task counts
const totalTasksSpan = document.getElementById("totalTasks")
const completedTasksSpan = document.getElementById("completedTasks")
const pendingTasksSpan = document.getElementById("pendingTasks")

// EVENT LISTENERS SETUP
// Setting up event listeners when the DOM is fully loaded
// This ensures all elements exist before we try to attach events to them

document.addEventListener("DOMContentLoaded", () => {
  // Load tasks from JSON file on startup
  loadTasksFromJSON()

  // Event listener for the "Add Task" button
  addTaskBtn.addEventListener("click", addTask)

  // Event listener for Enter key press in the input field
  taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addTask()
    }
  })

  // Event listener for the "Clear Completed" button
  clearCompletedBtn.addEventListener("click", clearCompletedTasks)
})

// CORE FUNCTIONALITY - ADD TASK
// Function to add a new task to the list
// Demonstrates DOM manipulation by creating new elements and adding them to the DOM

function addTask() {
  // Get the task text from the input field and remove extra whitespace
  const taskText = taskInput.value.trim()

  // Validation: Check if the input is not empty
  if (taskText === "") {
    // Show user feedback for empty input
    alert("Please enter a task!")
    return // Exit the function early if input is invalid
  }

  // Create a new task object with unique properties
  const newTask = {
    id: ++taskIdCounter, // Unique identifier for the task
    text: taskText, // The actual task description
    completed: false, // Initial completion status
    createdAt: new Date(), // Timestamp for when task was created
  }

  // Add the new task to our tasks array (data manipulation)
  tasks.push(newTask)

  // Clear the input field after adding the task (DOM manipulation)
  taskInput.value = ""

  // Re-render the task list to show the new task (DOM manipulation)
  renderTasks()

  // Update the statistics display
  updateStatistics()

  // Focus back on the input field for better user experience
  taskInput.focus()
}

// DOM MANIPULATION - RENDER TASKS
// Function to render all tasks in the DOM
// This is the main DOM manipulation function that creates HTML elements dynamically

function renderTasks() {
  // Clear the existing task list (DOM manipulation)
  // This removes all child elements from the task list container
  taskList.innerHTML = ""

  // Check if there are no tasks to display
  if (tasks.length === 0) {
    // Show empty state message (DOM manipulation)
    emptyState.style.display = "block"
    return // Exit early if no tasks to render
  }

  // Hide empty state message when tasks exist (DOM manipulation)
  emptyState.style.display = "none"

  // Loop through each task and create DOM elements for them
  tasks.forEach((task) => {
    // Create the main list item element (DOM creation)
    const listItem = document.createElement("li")
    listItem.className = "task-item" // Add CSS class for styling

    // Add 'completed' class if task is completed (conditional DOM manipulation)
    if (task.completed) {
      listItem.classList.add("completed")
    }

    // Create checkbox element for marking task as complete (DOM creation)
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.className = "task-checkbox"
    checkbox.checked = task.completed // Set initial state based on task data

    // Add event listener to checkbox for toggling completion (DOM event handling)
    checkbox.addEventListener("change", () => {
      toggleTaskCompletion(task.id) // Call function to handle completion toggle
    })

    // Create span element for task text (DOM creation)
    const taskTextSpan = document.createElement("span")
    taskTextSpan.className = "task-text"
    taskTextSpan.textContent = task.text // Set the text content

    // Create delete button (DOM creation)
    const deleteButton = document.createElement("button")
    deleteButton.className = "delete-btn"
    deleteButton.textContent = "Delete"

    // Add event listener to delete button (DOM event handling)
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id) // Call function to handle task deletion
    })

    // Assemble the task item by appending child elements (DOM manipulation)
    listItem.appendChild(checkbox) // Add checkbox to list item
    listItem.appendChild(taskTextSpan) // Add task text to list item
    listItem.appendChild(deleteButton) // Add delete button to list item

    // Add the complete task item to the task list (DOM manipulation)
    taskList.appendChild(listItem)
  })
}

// TASK COMPLETION FUNCTIONALITY
// Function to toggle the completion status of a task
// Demonstrates data manipulation followed by DOM re-rendering

function toggleTaskCompletion(taskId) {
  // Find the task in our data array using the unique ID
  const task = tasks.find((t) => t.id === taskId)

  // If task is found, toggle its completion status
  if (task) {
    task.completed = !task.completed // Toggle boolean value

    // Re-render the tasks to reflect the change in the DOM
    renderTasks()

    // Update statistics to reflect the change
    updateStatistics()
  }
}

// TASK DELETION FUNCTIONALITY
// Function to delete a task from the list
// Demonstrates array manipulation and DOM re-rendering

function deleteTask(taskId) {
  // Show confirmation dialog before deleting (user experience enhancement)
  const confirmDelete = confirm("Are you sure you want to delete this task?")

  if (confirmDelete) {
    // Remove the task from the tasks array using filter method
    // This creates a new array without the task that matches the given ID
    tasks = tasks.filter((task) => {
      return task.id !== taskId // Keep all tasks except the one with matching ID
    })

    // Re-render the task list to reflect the deletion (DOM manipulation)
    renderTasks()

    // Update statistics
    updateStatistics()
  }
}
// CLEAR COMPLETED TASKS FUNCTIONALITY
// Function to remove all completed tasks at once
// Demonstrates bulk data manipulation and DOM updates

function clearCompletedTasks() {
  // Check if there are any completed tasks
  const completedTasks = tasks.filter((task) => task.completed)

  if (completedTasks.length === 0) {
    alert("No completed tasks to clear!")
    return
  }

  // Show confirmation dialog
  const confirmClear = confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)

  if (confirmClear) {
    // Filter out completed tasks, keeping only incomplete ones
    tasks = tasks.filter((task) => {
      return !task.completed // Keep only tasks that are NOT completed
    })

    // Re-render the task list (DOM manipulation)
    renderTasks()

    // Update statistics
    updateStatistics()
  }
}

// STATISTICS UPDATE FUNCTIONALITY
// Function to update the task statistics display
// Demonstrates DOM text content manipulation

function updateStatistics() {
  // Calculate statistics from the tasks array
  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const pending = total - completed

  // Update the DOM elements with new statistics (DOM manipulation)
  totalTasksSpan.textContent = `Total: ${total}`
  completedTasksSpan.textContent = `Completed: ${completed}`
  pendingTasksSpan.textContent = `Pending: ${pending}`

  // Enable/disable the clear completed button based on whether there are completed tasks
  clearCompletedBtn.disabled = completed === 0
}
// DATA EXPORT FUNCTIONALITY
// Function to export current tasks as JSON
// Demonstrates data serialization and file download

function exportTasksAsJSON() {
  // Create export data structure
  const exportData = {
    tasks: tasks.map((task) => ({
      ...task,
      createdAt: task.createdAt.toISOString(), // Convert Date objects to ISO strings
    })),
    exportedAt: new Date().toISOString(),
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.completed).length,
  }

  // Convert to JSON string with formatting
  const jsonString = JSON.stringify(exportData, null, 2)

  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" })

  // Create a download link and trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `todo-tasks-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  console.log("Tasks exported as JSON")
}

// ADDITIONAL DOM MANIPULATION EXAMPLES

// Function to add visual feedback when tasks are added (optional enhancement)
function showTaskAddedFeedback() {
  // Create a temporary notification element (DOM creation)
  const notification = document.createElement("div")
  notification.textContent = "Task added successfully!"
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `

  // Add notification to the DOM
  document.body.appendChild(notification)

  // Remove notification after 2 seconds (DOM manipulation with timing)
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 2000)
}

// SUMMARY OF DOM MANIPULATION TECHNIQUES USED:
/*
1. Element Selection:
   - document.getElementById() - Getting references to specific elements
   - document.querySelector() - Alternative selection method

2. Element Creation:
   - document.createElement() - Creating new HTML elements dynamically

3. Content Manipulation:
   - element.textContent - Setting text content of elements
   - element.innerHTML - Setting HTML content (used for clearing containers)

4. Attribute Manipulation:
   - element.className - Setting CSS classes
   - element.classList.add/remove() - Adding/removing specific classes
   - element.checked - Setting checkbox state
   - element.disabled - Enabling/disabling buttons

5. DOM Tree Manipulation:
   - element.appendChild() - Adding child elements
   - element.removeChild() - Removing child elements
   - parent.innerHTML = '' - Clearing all child elements

6. Event Handling:
   - element.addEventListener() - Attaching event listeners
   - Event delegation and handling user interactions

7. Style Manipulation:
   - element.style.display - Showing/hiding elements
   - element.style.cssText - Setting multiple CSS properties

8. Form Handling:
   - input.value - Getting/setting input field values
   - input.focus() - Setting focus to input elements

All these techniques work together to create a dynamic, interactive web application
that responds to user actions and updates the interface in real-time.
*/
