import Books from "../../Pages/Books";
import BooksAdd from "../../Pages/BooksAdd";
import BooksCategoryAdd from "../../Pages/BooksCategoryAdd";
import BooksCategoryList from "../../Pages/BooksCategoryList";
import BooksEdit from "../../Pages/BooksEdit";
import BooksEnd from "../../Pages/BooksEnd";
import BooksList from "../../Pages/BooksList";
import BooksMe from "../../Pages/BooksMe";
import BookView from "../../Pages/BooksView";
import EmailList from "../../Pages/Email";
import Home from "../../Pages/Home";
import LessonDetail from "../../Pages/LessonDetails";
import LessonEdit from "../../Pages/LessonEdit";
import LessonList from "../../Pages/LessonList";
import Lessons from "../../Pages/Lessons";
import LessonAdd from "../../Pages/LessonsAdd";
import LessonsEnd from "../../Pages/LessonsEnd";
import LessonsMe from "../../Pages/LessonsMe";
import Login from "../../Pages/Login";
import Chat from "../../Pages/Messages";
import NewsPage from "../../Pages/News";
import NewsAdd from "../../Pages/NewsAdd";
import NewsCategory from "../../Pages/NewsCategory";
import NotificationAdd from "../../Pages/NotificationAdd";
import Register from "../../Pages/Register";
import Test from "../../Pages/Test";
import TestAdd from "../../Pages/TestAdd";
import TestEdit from "../../Pages/TestEdit";
import Users from "../../Pages/Users";
import UserView from "../../Pages/UsersView";
import AuthLayout from "../Layouts/AuthLayout";
import MainLayout from "../Layouts/MainLayout";
import AngilalSurgaltAdd from "../../Pages/AngilalSurgaltAdd";
import BookDetail from "../../Pages/BookUserView";
import AngilalSurgaltList from "../../Pages/AngilalSurgaltList";
import RulesList from "../../Pages/RulesList";

export const routes = [
  {
    path: "/login",
    element: <Login/>,
    layout: AuthLayout,    
    protected: false,  
  },
  {
    path:"/register",
    element: <Register/>,
    layout: AuthLayout,
    protected:false
  },
  {
    path:"/",
    element: <Home/>,
    layout: MainLayout,
    protected:true
  },
  {
    path:"/lessons-open",
    element:<Lessons/>,
    layout: MainLayout,
    protected:true
  },
  {
    path:"/lessons-enrolled",
    element:<LessonsMe/>,
    layout: MainLayout,
    protected:true
  },
   {
    path:"/lessons-end",
    element:<LessonsEnd/>,
    layout: MainLayout,
    protected:true
  },
  {
    path: "/lessons/:id",
    element: <LessonDetail/>,
    layout: MainLayout,
    protected:true
  },
  {
    path: "/lessons-list",
    element: <LessonList/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "lesson", action: "view" },
  },
  {
    path: "/lessons-edit/:id",
    element: <LessonEdit/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "lesson", action: "edit" },
  },
  {
    path: "/lessons-add",
    element: <LessonAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "lesson", action: "add" },
  },
  {
    path: "/messages",
    element: <Chat/>,
    layout: MainLayout,
    protected:true
  },
  {
    path: "/email",
    element: <EmailList/>,
    layout: MainLayout,
    protected:true
  },
  {
    path: "/news",
    element: <NewsPage/>,
    layout: MainLayout,
    protected:true
  },
  {
    path: "/users",
    element: <Users/>,
    layout: MainLayout,
    protected:true,
  },
  {
    path: "/user/:id",
    element: <UserView/>,
    layout: MainLayout,
    protected:true,
  
  },
  {
    path: "/news-category-list",
    element: <NewsCategory/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "news", action: "view" },
  },
  {
    path: "/news-add",
    element: <NewsAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "news", action: "add" },
  },
  {
    path: "/notification-add",
    element: <NotificationAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "news", action: "add" },
  },
  {
    path: "/books-open",
    element: <Books/>,
    layout: MainLayout,
    protected:true,
  },
  {
    path: "/books-enrolled",
    element: <BooksMe/>,
    layout: MainLayout,
    protected:true,
  },
  {
    path: "/books-end",
    element: <BooksEnd/>,
    layout: MainLayout,
    protected:true,
  },

  // НОМНЫ ЦЭС 
  
  {
    path: "/books-list",
    element: <BooksList/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "books", action: "view" },
  },
  {
    path: "/books-add",
    element: <BooksAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "books", action: "add" },
  },
  {
    path: "/books-edit/:id",
    element: <BooksEdit/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "books", action: "edit" },
  },
  {
    path: "/books-view/:id",
    element: <BookView/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "books", action: "view" },
  },
  {
    path: "/books-category-list",
    element: <BooksCategoryList/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "bookscategories", action: "view" },
  },
  {
    path: "/books-category-add",
    element: <BooksCategoryAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "bookscategories", action: "add" },
  },
  {
    path: "/books/:id",
    element: <BookDetail/>,
    layout: MainLayout,
    protected:true,
  },
  {
    path: "/test-list",
    element: <Test/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "test", action: "view" },
  },
  {
    path: "/test-add",
    element: <TestAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "test", action: "add" },
  },
  {
    path: "/test-edit/:id",
    element: <TestEdit/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "test", action: "edit" },
  },
  {
    path: "/angilal-surgalt-add",
    element: <AngilalSurgaltAdd/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "test", action: "edit" },
  },
  {
    path: "/angilal-surgalt-list",
    element: <AngilalSurgaltList/>,
    layout: MainLayout,
    protected:true,
    permission: { module: "report", action: "view" },
  },
    {
    path: "/rules",
    element: <RulesList/>,
    layout: MainLayout,
    protected:true,
  },
  
];
