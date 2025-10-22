import React from 'react';
import { Link } from 'react-router-dom';

function Header({ currentUser, setCurrentUser }) {
  // 创建内联样式对象
  const styles = {
    container: {
      position: 'relative'
    },
    desktopHeader: {
      display: 'block'
    },
    mobileHeader: {
      display: 'none',
      backgroundColor: 'var(--primary-color)',
      padding: '15px 20px',
      textAlign: 'center',
      boxShadow: 'var(--shadow)'
    },
    mobileTitle: {
      margin: 0,
      color: 'white',
      fontSize: '18px'
    },
    mobileNav: {
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--primary-color)',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
    },
    mobileNavUl: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: 0,
      margin: 0,
      listStyle: 'none'
    },
    mobileNavLi: {
      flex: 1,
      textAlign: 'center'
    },
    mobileNavLink: {
      display: 'block',
      padding: '15px 10px',
      color: 'white',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'background-color 0.3s'
    },
    mobileNavLinkHover: {
      backgroundColor: 'var(--primary-dark)'
    }
  };

  // 使用媒体查询来切换显示
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileHeader = document.querySelector('.mobile-header');
      const desktopHeader = document.querySelector('.desktop-header');
      
      if (mobileNav && desktopHeader && mobileHeader) {
        if (isMobile) {
          mobileNav.style.display = 'block';
          mobileHeader.style.display = 'block';
          desktopHeader.style.display = 'none';
          document.body.style.paddingBottom = '60px'; // 为移动端添加底部边距
        } else {
          mobileNav.style.display = 'none';
          mobileHeader.style.display = 'none';
          desktopHeader.style.display = 'block';
          document.body.style.paddingBottom = '0';
        }
      }
    };

    // 初始化
    handleResize();
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      {/* 手机端顶部标题 */}
      <div className="mobile-header" style={styles.mobileHeader}>
        <h1 style={styles.mobileTitle}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            企业内部跳蚤市场
          </Link>
        </h1>
      </div>
      
      {/* 桌面端顶部导航 */}
      <header className="desktop-header" style={styles.desktopHeader}>
        <div className="header-content">
          <h1>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              企业内部跳蚤市场
            </Link>
          </h1>
          
          <nav>
            <ul>
              <li>
                <Link to="/">首页</Link>
              </li>
              
              {currentUser && (
                <>
                  <li>
                    <Link to={`/user/${currentUser.id || currentUser._id}`}>我的物品</Link>
                  </li>
                  <li>
                    <Link to="/add">发布物品</Link>
                  </li>
                  <li>
                    <Link to="/profile">{currentUser.name || currentUser.ip || '访客'}</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      
      {/* 手机端底部导航 */}
      <div className="mobile-nav" style={styles.mobileNav}>
        <ul style={styles.mobileNavUl}>
          <li style={styles.mobileNavLi}>
            <Link to="/" style={styles.mobileNavLink}>首页</Link>
          </li>
          
          {currentUser && (
            <>
              <li style={styles.mobileNavLi}>
                <Link to={`/user/${currentUser.id || currentUser._id}`} style={styles.mobileNavLink}>我的物品</Link>
              </li>
              <li style={styles.mobileNavLi}>
                <Link to="/add" style={styles.mobileNavLink}>发布物品</Link>
              </li>
              <li style={styles.mobileNavLi}>
                <Link to="/profile" style={styles.mobileNavLink}>{currentUser.name || currentUser.ip || '访客'}</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Header;